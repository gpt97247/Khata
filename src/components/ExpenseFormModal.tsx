import { useState, useEffect } from 'react';
import { useKhata } from '../context/useKhata';
import type { Expense } from '../types';
import {
  XIcon, CalendarIcon, CreditCardIcon,
  PlusIcon
} from '../components/Icons';

interface ExpenseFormModalProps {
  initialData?: Expense | null;
  categories: { id: string; name: string; icon: string; color: string }[];
  tags: { id: string; name: string; color: string }[];
  onClose: () => void;
}

const getInitialState = (initialData?: Expense | null, categories?: { id: string }[]) => ({
  amount: initialData?.amount.toString() || '',
  description: initialData?.description || '',
  categoryId: initialData?.categoryId || categories?.[0]?.id || '',
  tagIds: initialData?.tagIds || [],
  date: initialData?.date.split('T')[0] || new Date().toISOString().split('T')[0],
});

export function ExpenseFormModal({ initialData, categories, tags, onClose }: ExpenseFormModalProps) {
  const { addExpense, editExpense, addCategory, addTag } = useKhata();
  const isEditing = !!initialData;

  const [amount, setAmount] = useState(() => getInitialState(initialData, categories).amount);
  const [description, setDescription] = useState(() => getInitialState(initialData, categories).description);
  const [categoryId, setCategoryId] = useState(() => getInitialState(initialData, categories).categoryId);
  const [tagIds, setTagIds] = useState(() => getInitialState(initialData, categories).tagIds);
  const [date, setDate] = useState(() => getInitialState(initialData, categories).date);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [showNewTag, setShowNewTag] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryIcon, setNewCategoryIcon] = useState('📦');
  const [newCategoryColor, setNewCategoryColor] = useState('#6B7280');
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState('#6B7280');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const state = getInitialState(initialData, categories);
    setAmount(state.amount);
    setDescription(state.description);
    setCategoryId(state.categoryId);
    setTagIds(state.tagIds);
    setDate(state.date);
    setErrors({});
  }, [initialData, categories]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!amount || parseFloat(amount) <= 0) newErrors.amount = 'Enter a valid amount';
    if (!description.trim()) newErrors.description = 'Description is required';
    if (!categoryId) newErrors.category = 'Select a category';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const data = {
      amount: parseFloat(amount),
      description: description.trim(),
      categoryId,
      tagIds,
      date,
    };

    if (isEditing && initialData) {
      await editExpense({ ...initialData, ...data });
    } else {
      await addExpense(data);
    }
    onClose();
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    const category = await addCategory({ name: newCategoryName.trim(), icon: newCategoryIcon, color: newCategoryColor });
    setCategoryId(category.id);
    setShowNewCategory(false);
    setNewCategoryName('');
  };

  const handleCreateTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTagName.trim()) return;
    const tag = await addTag({ name: newTagName.trim(), color: newTagColor });
    setTagIds(current => current.includes(tag.id) ? current : [...current, tag.id]);
    setShowNewTag(false);
    setNewTagName('');
  };

  const toggleTag = (tagId: string) => {
    setTagIds(prev => prev.includes(tagId)
      ? prev.filter(id => id !== tagId)
      : [...prev, tagId]
    );
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="expense-modal-title">
      <div className="modal max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="expense-modal-title" className="modal-title">{isEditing ? 'Edit Expense' : 'Add Expense'}</h2>
          <button className="modal-close icon-btn" onClick={onClose} aria-label="Close">
            <XIcon className="icon" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body space-y-5" id="expense-form">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Amount <span className="text-danger">*</span></label>
              <div className="relative input-icon">
                <CreditCardIcon className="icon-sm text-dim" />
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={e => { setAmount(e.target.value); if (errors.amount) setErrors(p => ({ ...p, amount: '' })); }}
                  className="input pl-10"
                  placeholder="0.00"
                  autoFocus
                  aria-invalid={!!errors.amount}
                  aria-describedby={errors.amount ? 'amount-error' : undefined}
                />
              </div>
              {errors.amount && <p id="amount-error" className="form-error" role="alert"><XIcon className="icon-xs" /> {errors.amount}</p>}
            </div>
            <div>
              <label className="label">Date <span className="text-danger">*</span></label>
              <div className="relative input-icon">
                <CalendarIcon className="icon-sm text-dim" />
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="input pl-10"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="label">Description <span className="text-danger">*</span></label>
            <input
              type="text"
              value={description}
              onChange={e => { setDescription(e.target.value); if (errors.description) setErrors(p => ({ ...p, description: '' })); }}
              className="input"
              placeholder="What did you spend on?"
              aria-invalid={!!errors.description}
              aria-describedby={errors.description ? 'desc-error' : undefined}
            />
            {errors.description && <p id="desc-error" className="form-error" role="alert"><XIcon className="icon-xs" /> {errors.description}</p>}
          </div>

          <div>
            <label className="label">Category <span className="text-danger">*</span></label>
            <div className="category-selector" role="group" aria-label="Select category">
              {categories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => { setCategoryId(cat.id); if (errors.category) setErrors(p => ({ ...p, category: '' })); }}
                  className={`category-btn ${categoryId === cat.id ? 'active' : ''}`}
                  style={{ backgroundColor: categoryId === cat.id ? cat.color : undefined, borderColor: categoryId === cat.id ? cat.color : undefined, color: categoryId === cat.id ? 'white' : undefined }}
                  aria-pressed={categoryId === cat.id}
                >
                  <span>{cat.icon}</span> {cat.name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowNewCategory(true)}
                className="category-btn"
              >
                <PlusIcon className="icon-sm" /> New Category
              </button>
            </div>
            {errors.category && <p className="form-error" role="alert"><XIcon className="icon-xs" /> {errors.category}</p>}
          </div>

          <div>
            <label className="label">Tags <span className="text-dim">(optional)</span></label>
            <div className="tag-selector" role="group" aria-label="Select tags">
              {tags.map(tag => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => toggleTag(tag.id)}
                  className={`tag-btn ${tagIds.includes(tag.id) ? 'active' : ''}`}
                  style={{
                    backgroundColor: tagIds.includes(tag.id) ? tag.color : undefined,
                    borderColor: tagIds.includes(tag.id) ? tag.color : undefined,
                    color: tagIds.includes(tag.id) ? 'white' : undefined
                  }}
                  aria-pressed={tagIds.includes(tag.id)}
                >
                  {tag.name}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setShowNewTag(true)}
                className="tag-btn"
              >
                <PlusIcon className="icon-sm" /> New Tag
              </button>
            </div>
          </div>
        </form>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" form="expense-form" className="btn-primary">
            {isEditing ? 'Save Changes' : 'Add Expense'}
          </button>
        </div>

        {showNewCategory && (
          <div className="modal-overlay" onClick={() => setShowNewCategory(false)} role="dialog" aria-modal="true" aria-labelledby="new-category-title">
            <div className="modal max-w-md" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 id="new-category-title" className="modal-title">New Category</h3>
                <button className="modal-close icon-btn" onClick={() => setShowNewCategory(false)}><XIcon className="icon" /></button>
              </div>
              <form onSubmit={handleCreateCategory} className="modal-body space-y-4">
                <div>
                  <label className="label">Name <span className="text-danger">*</span></label>
                  <input type="text" value={newCategoryName} onChange={e => setNewCategoryName(e.target.value)} className="input" required autoFocus />
                </div>
                <div>
                  <label className="label">Icon</label>
                  <input type="text" value={newCategoryIcon} onChange={e => setNewCategoryIcon(e.target.value)} className="input" placeholder="📦" maxLength={2} />
                </div>
                <div>
                  <label className="label">Color</label>
                  <input type="color" value={newCategoryColor} onChange={e => setNewCategoryColor(e.target.value)} className="w-12 h-10 rounded-lg border cursor-pointer" />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" className="btn-secondary" onClick={() => setShowNewCategory(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Create</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showNewTag && (
          <div className="modal-overlay" onClick={() => setShowNewTag(false)} role="dialog" aria-modal="true" aria-labelledby="new-tag-title">
            <div className="modal max-w-md" onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3 id="new-tag-title" className="modal-title">New Tag</h3>
                <button className="modal-close icon-btn" onClick={() => setShowNewTag(false)}><XIcon className="icon" /></button>
              </div>
              <form onSubmit={handleCreateTag} className="modal-body space-y-4">
                <div>
                  <label className="label">Name <span className="text-danger">*</span></label>
                  <input type="text" value={newTagName} onChange={e => setNewTagName(e.target.value)} className="input" required autoFocus />
                </div>
                <div>
                  <label className="label">Color</label>
                  <input type="color" value={newTagColor} onChange={e => setNewTagColor(e.target.value)} className="w-12 h-10 rounded-lg border cursor-pointer" />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" className="btn-secondary" onClick={() => setShowNewTag(false)}>Cancel</button>
                  <button type="submit" className="btn-primary">Create</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
