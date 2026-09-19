import type { Expense } from '../types';

export function isCredit(expense: Pick<Expense, 'transactionType'>): boolean {
  return expense.transactionType === 'credit';
}

/** A credit offsets debits in every net total. */
export function spendingAmount(expense: Pick<Expense, 'amount' | 'transactionType'>): number {
  return isCredit(expense) ? -expense.amount : expense.amount;
}

export function totalAmountLabel(amount: number): string {
  const sign = amount < 0 ? '−' : '';
  return `${sign}₹${Math.abs(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}

export function transactionAmountLabel(expense: Pick<Expense, 'amount' | 'transactionType'>): string {
  const sign = isCredit(expense) ? '+' : '−';
  return `${sign}₹${expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}
