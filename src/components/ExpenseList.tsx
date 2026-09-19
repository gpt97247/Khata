import type { Expense, Category, Tag } from '../types';
import { formatDate } from '../utils/date';
import { isCredit, spendingAmount, totalAmountLabel, transactionAmountLabel } from '../utils/transactions';

interface ExpenseListProps {
  expenses: Expense[];
  categories: Category[];
  tags: Tag[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export function ExpenseList({ expenses, categories, tags, onEdit, onDelete }: ExpenseListProps) {
  const getCategory = (id: string) => categories.find(c => c.id === id);
  const getTags = (ids: string[]) => tags.filter(t => ids.includes(t.id));

  if (expenses.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">No expenses yet</p>
        <p className="text-sm mt-1">Add your first expense above</p>
      </div>
    );
  }

  const grouped = expenses.reduce((acc, expense) => {
    const key = expense.date.split('T')[0];
    if (!acc[key]) acc[key] = [];
    acc[key].push(expense);
    return acc;
  }, {} as Record<string, Expense[]>);

  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <div className="space-y-6">
      {sortedDates.map(dateKey => {
        const dayExpenses = grouped[dateKey];
        const dayTotal = dayExpenses.reduce((sum, expense) => sum + spendingAmount(expense), 0);
        return (
          <div key={dateKey} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <span className="font-semibold text-gray-900">{formatDate(dateKey)}</span>
              <span className="text-sm font-medium text-gray-600">{totalAmountLabel(dayTotal)}</span>
            </div>
            <div className="divide-y divide-gray-100">
              {dayExpenses.map(expense => {
                const category = getCategory(expense.categoryId);
                const expenseTags = getTags(expense.tagIds);
                return (
                  <div
                    key={expense.id}
                    className="px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3"
                  >
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-xl" style={{ backgroundColor: category?.color + '20' }}>
                      <span>{category?.icon || '📦'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{expense.description}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {category && (
                          <span className="px-2 py-0.5 rounded text-xs font-medium text-white" style={{ backgroundColor: category.color }}>
                            {category.name}
                          </span>
                        )}
                        {expenseTags.map(tag => (
                          <span key={tag.id} className="px-2 py-0.5 rounded text-xs font-medium text-white" style={{ backgroundColor: tag.color }}>
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${isCredit(expense) ? 'text-success' : 'text-danger'}`}>
                        {transactionAmountLabel(expense)}
                      </span>
                      <button
                        onClick={() => onEdit(expense)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                        aria-label="Edit"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      </button>
                      <button
                        onClick={() => onDelete(expense.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                        aria-label="Delete"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
