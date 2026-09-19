import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';

dotenv.config({ path: new URL('./.env', import.meta.url) });

const app = express();
const port = Number(process.env.PORT || 4000);
const mongoUri = process.env.MONGODB_URI;
const apiToken = process.env.API_TOKEN;
const clientOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';

const defaultCategories = [
  { id: 'food', name: 'Food & Dining', icon: '🍔', color: '#EF4444' },
  { id: 'transport', name: 'Transport', icon: '🚌', color: '#3B82F6' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#8B5CF6' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎮', color: '#EC4899' },
  { id: 'health', name: 'Health & Medical', icon: '🏥', color: '#10B981' },
  { id: 'utilities', name: 'Utilities', icon: '💡', color: '#F59E0B' },
  { id: 'education', name: 'Education', icon: '📚', color: '#06B6D4' },
  { id: 'other', name: 'Other', icon: '📦', color: '#6B7280' },
];

const defaultTags = [
  { id: 'essential', name: 'Essential', color: '#EF4444' },
  { id: 'want', name: 'Want', color: '#3B82F6' },
  { id: 'investment', name: 'Investment', color: '#10B981' },
  { id: 'emergency', name: 'Emergency', color: '#F59E0B' },
];

const commonOptions = { versionKey: false };
const expenseSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  id: { type: String, required: true },
  amount: { type: Number, required: true, min: 0.01 },
  transactionType: { type: String, enum: ['debit', 'credit'], default: 'debit' },
  description: { type: String, required: true, trim: true, maxlength: 200 },
  categoryId: { type: String, required: true },
  tagIds: { type: [String], default: [] },
  date: { type: String, required: true },
  createdAt: { type: String, required: true },
}, commonOptions);
expenseSchema.index({ userId: 1, id: 1 }, { unique: true });

const categorySchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  id: { type: String, required: true },
  name: { type: String, required: true, trim: true, maxlength: 60 },
  icon: { type: String, required: true, maxlength: 8 },
  color: { type: String, required: true, match: /^#[0-9a-fA-F]{6}$/ },
}, commonOptions);
categorySchema.index({ userId: 1, id: 1 }, { unique: true });

const tagSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  id: { type: String, required: true },
  name: { type: String, required: true, trim: true, maxlength: 60 },
  color: { type: String, required: true, match: /^#[0-9a-fA-F]{6}$/ },
}, commonOptions);
tagSchema.index({ userId: 1, id: 1 }, { unique: true });

// Records that a user's starter data has already been created. Counting rows
// cannot distinguish a new user from someone who deliberately deleted every
// default category or tag.
const userStateSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  defaultsSeeded: { type: Boolean, default: true },
}, commonOptions);

const Expense = mongoose.model('Expense', expenseSchema);
const Category = mongoose.model('Category', categorySchema);
const Tag = mongoose.model('Tag', tagSchema);
const UserState = mongoose.model('UserState', userStateSchema);

app.use(cors({ origin: clientOrigin }));
app.use(express.json({ limit: '100kb' }));

app.use((req, res, next) => {
  if (apiToken && req.header('authorization') !== `Bearer ${apiToken}`) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  req.userId = req.header('x-khata-user-id') || 'default';
  next();
});

const publicFields = (document) => Object.fromEntries(
  Object.entries(document).filter(([key]) => !['_id', 'userId', 'updatedAt'].includes(key)),
);
const getId = (req) => String(req.params.id || '').trim();

async function ensureDefaults(userId) {
  const existingState = await UserState.findOne({ userId }).lean();
  if (existingState?.defaultsSeeded) return;

  const [categoryCount, tagCount] = await Promise.all([
    Category.countDocuments({ userId }),
    Tag.countDocuments({ userId }),
  ]);
  const writes = [];
  if (categoryCount === 0) writes.push(Category.insertMany(defaultCategories.map(item => ({ ...item, userId }))));
  if (tagCount === 0) writes.push(Tag.insertMany(defaultTags.map(item => ({ ...item, userId }))));
  await Promise.all(writes);
  await UserState.updateOne({ userId }, { $set: { defaultsSeeded: true } }, { upsert: true });
}

function requireFields(res, payload, fields) {
  const invalid = fields.some(field => payload[field] === undefined || payload[field] === null || payload[field] === '');
  if (invalid) {
    res.status(400).json({ message: 'Required fields are missing' });
    return false;
  }
  return true;
}

app.get('/api/health', (_req, res) => res.json({ status: 'ok', database: mongoose.connection.readyState === 1 }));

app.get('/api/bootstrap', async (req, res, next) => {
  try {
    await ensureDefaults(req.userId);
    const [expenses, categories, tags] = await Promise.all([
      Expense.find({ userId: req.userId }).sort({ date: -1, createdAt: -1 }).lean(),
      Category.find({ userId: req.userId }).sort({ name: 1 }).lean(),
      Tag.find({ userId: req.userId }).sort({ name: 1 }).lean(),
    ]);
    res.json({
      expenses: expenses.map(publicFields),
      categories: categories.map(publicFields),
      tags: tags.map(publicFields),
    });
  } catch (error) { next(error); }
});

app.post('/api/expenses', async (req, res, next) => {
  try {
    const payload = req.body;
    if (!requireFields(res, payload, ['id', 'amount', 'description', 'categoryId', 'date', 'createdAt'])) return;
    const expense = await Expense.create({
      ...payload,
      userId: req.userId,
      transactionType: payload.transactionType === 'credit' ? 'credit' : 'debit',
      tagIds: Array.isArray(payload.tagIds) ? payload.tagIds : [],
    });
    res.status(201).json(publicFields(expense.toObject()));
  } catch (error) { next(error); }
});

app.put('/api/expenses/:id', async (req, res, next) => {
  try {
    const payload = req.body;
    if (!requireFields(res, payload, ['amount', 'description', 'categoryId', 'date', 'createdAt'])) return;
    const expense = await Expense.findOneAndUpdate(
      { userId: req.userId, id: getId(req) },
      {
        ...payload,
        id: getId(req),
        userId: req.userId,
        transactionType: payload.transactionType === 'credit' ? 'credit' : 'debit',
        tagIds: Array.isArray(payload.tagIds) ? payload.tagIds : [],
      },
      { new: true, runValidators: true },
    ).lean();
    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    res.json(publicFields(expense));
  } catch (error) { next(error); }
});

app.delete('/api/expenses/:id', async (req, res, next) => {
  try {
    const result = await Expense.deleteOne({ userId: req.userId, id: getId(req) });
    if (!result.deletedCount) return res.status(404).json({ message: 'Expense not found' });
    res.status(204).end();
  } catch (error) { next(error); }
});

function registerEntityRoutes(path, Model, fields) {
  app.post(`/api/${path}`, async (req, res, next) => {
    try {
      if (!requireFields(res, req.body, ['id', ...fields])) return;
      const entity = await Model.create({ ...req.body, userId: req.userId });
      res.status(201).json(publicFields(entity.toObject()));
    } catch (error) { next(error); }
  });

  app.put(`/api/${path}/:id`, async (req, res, next) => {
    try {
      if (!requireFields(res, req.body, fields)) return;
      const entity = await Model.findOneAndUpdate(
        { userId: req.userId, id: getId(req) },
        { ...req.body, id: getId(req), userId: req.userId },
        { new: true, runValidators: true },
      ).lean();
      if (!entity) return res.status(404).json({ message: `${path.slice(0, -1)} not found` });
      res.json(publicFields(entity));
    } catch (error) { next(error); }
  });

  app.delete(`/api/${path}/:id`, async (req, res, next) => {
    try {
      const result = await Model.deleteOne({ userId: req.userId, id: getId(req) });
      if (!result.deletedCount) return res.status(404).json({ message: `${path.slice(0, -1)} not found` });
      res.status(204).end();
    } catch (error) { next(error); }
  });
}

registerEntityRoutes('categories', Category, ['name', 'icon', 'color']);
registerEntityRoutes('tags', Tag, ['name', 'color']);

app.use((error, _req, res, _next) => {
  if (error?.code === 11000) return res.status(409).json({ message: 'This item already exists' });
  if (error?.name === 'ValidationError') return res.status(400).json({ message: error.message });
  console.error(error);
  res.status(500).json({ message: 'Unexpected server error' });
});

if (!mongoUri) {
  console.error('MONGODB_URI is missing. Add it to server/.env before starting the API.');
  process.exit(1);
}

mongoose.connect(mongoUri)
  .then(() => app.listen(port, '0.0.0.0', () => {
    console.log(`Khata API listening on port ${port}`);
  }))
  .catch(error => {
    console.error('Could not connect to MongoDB:', error.message);
    process.exit(1);
  });
