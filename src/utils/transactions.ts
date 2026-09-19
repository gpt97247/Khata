import type { Expense } from '../types';

export function isCredit(expense: Pick<Expense, 'transactionType'>): boolean {
  return expense.transactionType === 'credit';
}

/** Credits are received money, so they do not count as spending. */
export function spendingAmount(expense: Pick<Expense, 'amount' | 'transactionType'>): number {
  return isCredit(expense) ? 0 : expense.amount;
}

export function transactionAmountLabel(expense: Pick<Expense, 'amount' | 'transactionType'>): string {
  const sign = isCredit(expense) ? '+' : '−';
  return `${sign}₹${expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}
