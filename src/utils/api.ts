import type { Category, Expense, Tag } from '../types';

type BootstrapData = {
  expenses: Expense[];
  categories: Category[];
  tags: Tag[];
};

const apiBase = import.meta.env.VITE_API_URL || '/api';
const apiToken = import.meta.env.VITE_API_TOKEN;
const userId = import.meta.env.VITE_USER_ID || 'default';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  headers.set('x-khata-user-id', userId);
  if (apiToken) headers.set('Authorization', `Bearer ${apiToken}`);

  const response = await fetch(`${apiBase}${path}`, { ...options, headers });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json() as { message?: string };
      if (body.message) message = body.message;
    } catch {
      // A non-JSON response still has a useful HTTP status above.
    }
    throw new Error(message);
  }
  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

export const api = {
  getBootstrap: () => request<BootstrapData>('/bootstrap'),
  createExpense: (expense: Expense) => request<Expense>('/expenses', { method: 'POST', body: JSON.stringify(expense) }),
  updateExpense: (expense: Expense) => request<Expense>(`/expenses/${encodeURIComponent(expense.id)}`, { method: 'PUT', body: JSON.stringify(expense) }),
  deleteExpense: (id: string) => request<void>(`/expenses/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  createCategory: (category: Category) => request<Category>('/categories', { method: 'POST', body: JSON.stringify(category) }),
  createTag: (tag: Tag) => request<Tag>('/tags', { method: 'POST', body: JSON.stringify(tag) }),
};
