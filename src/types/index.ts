export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface Expense {
  id: string;
  amount: number;
  description: string;
  categoryId: string;
  tagIds: string[];
  date: string;
  createdAt: string;
}

export interface MonthlySummary {
  month: string;
  total: number;
  byCategory: Record<string, number>;
  byTag: Record<string, number>;
  dailyTotals: Record<string, number>;
}