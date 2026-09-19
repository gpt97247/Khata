import type { Category, Tag } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'food', name: 'Food & Dining', icon: '🍔', color: '#EF4444' },
  { id: 'transport', name: 'Transport', icon: '🚌', color: '#3B82F6' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', color: '#8B5CF6' },
  { id: 'entertainment', name: 'Entertainment', icon: '🎮', color: '#EC4899' },
  { id: 'health', name: 'Health & Medical', icon: '🏥', color: '#10B981' },
  { id: 'utilities', name: 'Utilities', icon: '💡', color: '#F59E0B' },
  { id: 'education', name: 'Education', icon: '📚', color: '#06B6D4' },
  { id: 'other', name: 'Other', icon: '📦', color: '#6B7280' },
];

export const DEFAULT_TAGS: Tag[] = [
  { id: 'essential', name: 'Essential', color: '#EF4444' },
  { id: 'want', name: 'Want', color: '#3B82F6' },
  { id: 'investment', name: 'Investment', color: '#10B981' },
  { id: 'emergency', name: 'Emergency', color: '#F59E0B' },
];

export const CATEGORY_COLORS = [
  '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899',
  '#10B981', '#F59E0B', '#06B6D4', '#6B7280',
  '#F97316', '#84CC16', '#14B8A6', '#A855F7',
];

export const TAG_COLORS = [
  '#EF4444', '#3B82F6', '#10B981', '#F59E0B',
  '#8B5CF6', '#EC4899', '#06B6D4', '#F97316',
];