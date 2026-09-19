import { createContext, useState, useEffect, useRef, type ReactNode } from 'react';
import type { Expense, Category, Tag } from '../types';
import {
  getExpenses, getCategories, getTags, saveExpenses, saveCategories, saveTags,
  addExpense as saveNewExpense, deleteExpense as deleteSavedExpense, updateExpense as updateSavedExpense,
  updateCategory as updateSavedCategory, deleteCategory as deleteSavedCategory,
  updateTag as updateSavedTag, deleteTag as deleteSavedTag,
} from '../utils/storage';
import { api } from '../utils/api';

interface KhataContextType {
  expenses: Expense[];
  categories: Category[];
  tags: Tag[];
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>;
  removeExpense: (id: string) => Promise<void>;
  editExpense: (expense: Expense) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<Category>;
  editCategory: (category: Category) => Promise<void>;
  removeCategory: (id: string) => Promise<void>;
  addTag: (tag: Omit<Tag, 'id'>) => Promise<Tag>;
  editTag: (tag: Tag) => Promise<void>;
  removeTag: (id: string) => Promise<void>;
  refresh: () => void;
}

export const KhataContext = createContext<KhataContextType | undefined>(undefined);

export function KhataProvider({ children }: { children: ReactNode }) {
  // Render the last known data immediately. It keeps the app usable offline and
  // prevents a successful but stale bootstrap request from briefly blanking data.
  const [expenses, setExpenses] = useState<Expense[]>(getExpenses);
  const [categories, setCategories] = useState<Category[]>(getCategories);
  const [tags, setTags] = useState<Tag[]>(getTags);
  const expensesRef = useRef(expenses);
  const categoriesRef = useRef(categories);
  const tagsRef = useRef(tags);
  const mutationVersion = useRef(0);

  const commitExpenses = (next: Expense[]) => {
    expensesRef.current = next;
    setExpenses(next);
    saveExpenses(next);
  };

  const commitCategories = (next: Category[]) => {
    categoriesRef.current = next;
    setCategories(next);
    saveCategories(next);
  };

  const commitTags = (next: Tag[]) => {
    tagsRef.current = next;
    setTags(next);
    saveTags(next);
  };

  const loadData = async () => {
    const versionAtStart = mutationVersion.current;
    try {
      const cloudData = await api.getBootstrap();
      // Do not overwrite an add/edit/delete that happened while the request was
      // in flight. This was the source of values disappearing after a refresh.
      if (mutationVersion.current !== versionAtStart) return;
      commitExpenses(cloudData.expenses);
      commitCategories(cloudData.categories);
      commitTags(cloudData.tags);
    } catch {
      // The local copy already rendered above and remains the offline fallback.
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleAddExpense = async (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expense,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    mutationVersion.current += 1;
    saveNewExpense(newExpense);
    const next = [newExpense, ...expensesRef.current.filter(item => item.id !== newExpense.id)];
    expensesRef.current = next;
    setExpenses(next);
    void api.createExpense(newExpense).catch(() => undefined);
  };

  const handleRemoveExpense = async (id: string) => {
    mutationVersion.current += 1;
    deleteSavedExpense(id);
    const next = expensesRef.current.filter(expense => expense.id !== id);
    expensesRef.current = next;
    setExpenses(next);
    void api.deleteExpense(id).catch(() => undefined);
  };

  const handleEditExpense = async (expense: Expense) => {
    mutationVersion.current += 1;
    updateSavedExpense(expense);
    const next = expensesRef.current.map(item => item.id === expense.id ? expense : item);
    expensesRef.current = next;
    setExpenses(next);
    void api.updateExpense(expense).catch(() => undefined);
  };

  const createId = (name: string, existingIds: string[], fallback: string) => {
    const base = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || fallback;
    let id = base;
    let suffix = 2;
    while (existingIds.includes(id)) id = `${base}-${suffix++}`;
    return id;
  };

  const handleAddCategory = async (category: Omit<Category, 'id'>) => {
    const newCategory: Category = { ...category, id: createId(category.name, categoriesRef.current.map(item => item.id), 'category') };
    mutationVersion.current += 1;
    commitCategories([...categoriesRef.current, newCategory]);
    void api.createCategory(newCategory).catch(() => undefined);
    return newCategory;
  };

  const handleEditCategory = async (category: Category) => {
    mutationVersion.current += 1;
    updateSavedCategory(category);
    commitCategories(categoriesRef.current.map(item => item.id === category.id ? category : item));
    void api.updateCategory(category).catch(() => undefined);
  };

  const handleRemoveCategory = async (id: string) => {
    mutationVersion.current += 1;
    deleteSavedCategory(id);
    commitCategories(categoriesRef.current.filter(category => category.id !== id));
    void api.deleteCategory(id).catch(() => undefined);
  };

  const handleAddTag = async (tag: Omit<Tag, 'id'>) => {
    const newTag: Tag = { ...tag, id: createId(tag.name, tagsRef.current.map(item => item.id), 'tag') };
    mutationVersion.current += 1;
    commitTags([...tagsRef.current, newTag]);
    void api.createTag(newTag).catch(() => undefined);
    return newTag;
  };

  const handleEditTag = async (tag: Tag) => {
    mutationVersion.current += 1;
    updateSavedTag(tag);
    commitTags(tagsRef.current.map(item => item.id === tag.id ? tag : item));
    void api.updateTag(tag).catch(() => undefined);
  };

  const handleRemoveTag = async (id: string) => {
    mutationVersion.current += 1;
    deleteSavedTag(id);
    commitTags(tagsRef.current.filter(tag => tag.id !== id));
    void api.deleteTag(id).catch(() => undefined);
  };

  return (
    <KhataContext.Provider value={{
      expenses,
      categories,
      tags,
      addExpense: handleAddExpense,
      removeExpense: handleRemoveExpense,
      editExpense: handleEditExpense,
      addCategory: handleAddCategory,
      editCategory: handleEditCategory,
      removeCategory: handleRemoveCategory,
      addTag: handleAddTag,
      editTag: handleEditTag,
      removeTag: handleRemoveTag,
      refresh: () => { void loadData(); },
    }}>
      {children}
    </KhataContext.Provider>
  );
}
