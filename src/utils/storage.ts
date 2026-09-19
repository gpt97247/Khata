import type { Expense, Category, Tag } from '../types';
import { DEFAULT_CATEGORIES, DEFAULT_TAGS } from '../data/defaults';

const STORAGE_KEYS = {
  EXPENSES: 'khata_expenses',
  CATEGORIES: 'khata_categories',
  TAGS: 'khata_tags',
};

export function getExpenses(): Expense[] {
  const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
  return data ? JSON.parse(data) : [];
}

export function saveExpenses(expenses: Expense[]): void {
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
}

export function getCategories(): Category[] {
  const data = localStorage.getItem(STORAGE_KEYS.CATEGORIES);
  return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
}

export function saveCategories(categories: Category[]): void {
  localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
}

export function getTags(): Tag[] {
  const data = localStorage.getItem(STORAGE_KEYS.TAGS);
  return data ? JSON.parse(data) : DEFAULT_TAGS;
}

export function saveTags(tags: Tag[]): void {
  localStorage.setItem(STORAGE_KEYS.TAGS, JSON.stringify(tags));
}

export function addExpense(expense: Expense): void {
  const expenses = getExpenses();
  expenses.unshift(expense);
  saveExpenses(expenses);
}

export function deleteExpense(id: string): void {
  const expenses = getExpenses().filter(e => e.id !== id);
  saveExpenses(expenses);
}

export function updateExpense(updated: Expense): void {
  const expenses = getExpenses().map(e => e.id === updated.id ? updated : e);
  saveExpenses(expenses);
}