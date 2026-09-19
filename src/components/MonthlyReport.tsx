import { useState, useMemo } from 'react';
import type { Expense, Category, Tag } from '../types';
import { getAvailableMonths, getMonthKey, formatMonth, getMonthRange } from '../utils/date';

interface MonthlyReportProps {
  expenses: Expense[];
  categories: Category[];
  tags: Tag[];
}

export function MonthlyReport({ expenses, categories, tags }: MonthlyReportProps) {
  const [selectedMonth, setSelectedMonth] = useState(getMonthKey(new Date()));
  const availableMonths = useMemo(() => getAvailableMonths(expenses), [expenses]);

  const monthExpenses = useMemo(() => {
    const { start, end } = getMonthRange(selectedMonth);
    return expenses.filter(e => {
      const d = new Date(e.date);
      return d >= start && d <= end;
    });
  }, [expenses, selectedMonth]);

  const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

  const byCategory = useMemo(() => {
    const result: Record<string, number> = {};
    monthExpenses.forEach(e => {
      result[e.categoryId] = (result[e.categoryId] || 0) + e.amount;
    });
    return result;
  }, [monthExpenses]);

  const byTag = useMemo(() => {
    const result: Record<string, number> = {};
    monthExpenses.forEach(e => {
      e.tagIds.forEach(tagId => {
        result[tagId] = (result[tagId] || 0) + e.amount;
      });
    });
    return result;
  }, [monthExpenses]);

  const dailyTotals = useMemo(() => {
    const result: Record<string, number> = {};
    monthExpenses.forEach(e => {
      const day = e.date.split('T')[0];
      result[day] = (result[day] || 0) + e.amount;
    });
    return result;
  }, [monthExpenses]);

  const sortedCategories = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([id, amount]) => ({ category: categories.find(c => c.id === id), amount }));

  const sortedTags = Object.entries(byTag)
    .sort((a, b) => b[1] - a[1])
    .map(([id, amount]) => ({ tag: tags.find(t => t.id === id), amount }));

  if (availableMonths.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-100 text-center text-gray-500">
        <p className="text-lg">No expense data yet</p>
        <p className="text-sm mt-1">Add expenses to see monthly reports</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Monthly Report</h2>
        <select
          value={selectedMonth}
          onChange={e => setSelectedMonth(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
        >
          {availableMonths.map(month => (
            <option key={month} value={month}>{formatMonth(month + '-01')}</option>
          ))}
        </select>
      </div>

      <div className="p-6">
        <div className="text-center mb-8">
          <p className="text-sm text-gray-500">Total for {formatMonth(selectedMonth + '-01')}</p>
          <p className="text-4xl font-bold text-gray-900 mt-1">₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">By Category</h3>
            {sortedCategories.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No category data</p>
            ) : (
              <div className="space-y-3">
                {sortedCategories.map(({ category, amount }) => (
                  category && (
                    <div key={category.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: category.color + '20' }}>
                          <span className="text-lg">{category.icon}</span>
                        </div>
                        <span className="font-medium text-gray-900">{category.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">₹{amount.toLocaleString('en-IN')}</p>
                        <p className="text-sm text-gray-500">{((amount / total) * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">By Tag</h3>
            {sortedTags.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No tag data</p>
            ) : (
              <div className="space-y-3">
                {sortedTags.map(({ tag, amount }) => (
                  tag && (
                    <div key={tag.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg" style={{ backgroundColor: tag.color + '20' }}></div>
                        <span className="font-medium text-gray-900">{tag.name}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">₹{amount.toLocaleString('en-IN')}</p>
                        <p className="text-sm text-gray-500">{((amount / total) * 100).toFixed(1)}%</p>
                      </div>
                    </div>
                  )
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Daily Breakdown</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {Object.entries(dailyTotals)
              .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
              .map(([date, amount]) => (
                <div key={date} className="p-3 bg-gray-50 rounded-lg text-center">
                  <p className="text-xs text-gray-500">{new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</p>
                  <p className="font-semibold text-gray-900">₹{amount.toLocaleString('en-IN')}</p>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}