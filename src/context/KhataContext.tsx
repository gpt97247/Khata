import { createContext, useState, useEffect, type ReactNode } from 'react';
import type { Expense, Category, Tag } from '../types';
import {
  getExpenses, getCategories, getTags, saveExpenses, saveCategories, saveTags,
  addExpense as saveNewExpense, deleteExpense as deleteSavedExpense, updateExpense as updateSavedExpense,
} from '../utils/storage';
import { api } from '../utils/api';

interface KhataContextType {
  expenses: Expense[];
  categories: Category[];
  tags: Tag[];
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  removeExpense: (id: string) => void;
  editExpense: (expense: Expense) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  addTag: (tag: Omit<Tag, 'id'>) => void;
  refresh: () => void;
}

export const KhataContext = createContext<KhataContextType | undefined>(undefined);

export function KhataProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const loadData = async () => {
    try {
      const cloudData = await api.getBootstrap();
      setExpenses(cloudData.expenses);
      setCategories(cloudData.categories);
      setTags(cloudData.tags);
      // Keep a usable offline copy if the API becomes unavailable later.
      saveExpenses(cloudData.expenses);
      saveCategories(cloudData.categories);
      saveTags(cloudData.tags);
    } catch {
      setExpenses(getExpenses());
      setCategories(getCategories());
      setTags(getTags());
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const handleAddExpense = (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expense,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    saveNewExpense(newExpense);
    setExpenses(current => [newExpense, ...current]);
    void api.createExpense(newExpense).catch(() => undefined);
  };

  const handleRemoveExpense = (id: string) => {
    deleteSavedExpense(id);
    setExpenses(current => current.filter(expense => expense.id !== id));
    void api.deleteExpense(id).catch(() => undefined);
  };

  const handleEditExpense = (expense: Expense) => {
    updateSavedExpense(expense);
    setExpenses(current => current.map(item => item.id === expense.id ? expense : item));
    void api.updateExpense(expense).catch(() => undefined);
  };

  const handleAddCategory = (category: Omit<Category, 'id'>) => {
    const newCategory: Category = { ...category, id: category.name.toLowerCase().replace(/\s+/g, '-') };
    const updated = [...categories, newCategory];
    setCategories(updated);
    saveCategories(updated);
    void api.createCategory(newCategory).catch(() => undefined);
  };

  const handleAddTag = (tag: Omit<Tag, 'id'>) => {
    const newTag: Tag = { ...tag, id: tag.name.toLowerCase().replace(/\s+/g, '-') };
    const updated = [...tags, newTag];
    setTags(updated);
    saveTags(updated);
    void api.createTag(newTag).catch(() => undefined);
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
      addTag: handleAddTag,
      refresh: () => { void loadData(); },
    }}>
      {children}
    </KhataContext.Provider>
  );
}
