import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useKhata } from '../context/useKhata';
import { formatMonth, getMonthKey, getMonthRange } from '../utils/date';
import { Layout } from '../components/Layout';
import { PlusIcon, TrendingUpIcon, ArrowDownIcon, ClockIcon, TargetIcon } from '../components/Icons';

const statCards = [
  { key: 'total', label: 'This Month', icon: TrendingUpIcon, color: '#3b82f6', gradient: 'from-blue-500 to-purple-500' },
  { key: 'dailyAvg', label: 'Daily Average', icon: ArrowDownIcon, color: '#10b981', gradient: 'from-emerald-500 to-teal-500' },
  { key: 'topCategory', label: 'Top Category', icon: TargetIcon, color: '#f59e0b', gradient: 'from-amber-500 to-orange-500' },
  { key: 'expenseCount', label: 'Transactions', icon: ClockIcon, color: '#8b5cf6', gradient: 'from-violet-500 to-pink-500' },
];

export function Dashboard() {
  const { expenses, categories, tags } = useKhata();
  const currentMonth = getMonthKey(new Date());
  const { start, end } = getMonthRange(currentMonth);

  const stats = useMemo(() => {
    const monthExpenses = expenses.filter(e => {
      const d = new Date(e.date);
      return d >= start && d <= end;
    });

    const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const daysInMonth = new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate();
    const dailyAvg = daysInMonth > 0 ? total / daysInMonth : 0;

    const byCategory: Record<string, number> = {};
    monthExpenses.forEach(e => {
      byCategory[e.categoryId] = (byCategory[e.categoryId] || 0) + e.amount;
    });
    const topCatEntry = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0];
    const topCategory = topCatEntry ? categories.find(c => c.id === topCatEntry[0]) : null;

    return { total, dailyAvg, topCategory, topCategoryAmount: topCatEntry?.[1] || 0, expenseCount: monthExpenses.length };
  }, [expenses, categories, start, end]);

  const recentExpenses = useMemo(() => {
    return [...expenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [expenses]);

  const categoryBreakdown = useMemo(() => {
    const monthExpenses = expenses.filter(e => {
      const d = new Date(e.date);
      return d >= start && d <= end;
    });
    const byCategory: Record<string, number> = {};
    monthExpenses.forEach(e => {
      byCategory[e.categoryId] = (byCategory[e.categoryId] || 0) + e.amount;
    });
    return Object.entries(byCategory)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id, amount]) => ({ category: categories.find(c => c.id === id), amount }));
  }, [expenses, categories, start, end]);

  const dailySpending = useMemo(() => {
    const monthExpenses = expenses.filter(e => {
      const d = new Date(e.date);
      return d >= start && d <= end;
    });
    const byDay: Record<string, number> = {};
    monthExpenses.forEach(e => {
      const day = e.date.split('T')[0];
      byDay[day] = (byDay[day] || 0) + e.amount;
    });
    const daysInMonth = new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate();
    const data = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const date = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      data.push({ date, amount: byDay[date] || 0 });
    }
    return data;
  }, [expenses, start, end]);

  const maxDaily = Math.max(...dailySpending.map(d => d.amount), 1);

  return (
    <Layout title="Dashboard" subtitle={`Overview for ${formatMonth(currentMonth + '-01')}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, i) => {
          let value: string;
          if (i === 0) value = `₹${stats.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
          else if (i === 1) value = `₹${stats.dailyAvg.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
          else if (i === 2) value = stats.topCategory ? `${stats.topCategory.icon} ${stats.topCategory.name}` : '—';
          else value = stats.expenseCount.toString();

          return (
            <div key={stat.key} className="stat-card group relative" style={{ '--stat-color': stat.color } as React.CSSProperties}>
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted uppercase tracking-wide">{stat.label}</p>
                  <p className="text-xl font-bold mt-1 truncate" style={{ fontSize: i === 2 ? '14px' : '22px' }}>{value}</p>
                  {i === 2 && stats.topCategory && (
                    <p className="mt-2 text-sm font-medium" style={{ color: stats.topCategory.color }}>
                      ₹{stats.topCategoryAmount.toLocaleString('en-IN')}
                    </p>
                  )}
                  {i === 0 && stats.total > 0 && (
                    <p className="mt-2 text-xs text-success flex items-center gap-1">
                      <TrendingUpIcon className="icon-xs" style={{ width: 12, height: 12 }} />
                      +12.5% vs last month
                    </p>
                  )}
                </div>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `linear-gradient(135deg, ${stat.color}20, ${stat.color}40)` }}>
                  <stat.icon className="icon-lg" style={{ color: stat.color }} />
                </div>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[var(--stat-color)]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-xl" />
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-5">
            <h2 className="section-title">Recent Expenses</h2>
            <Link to="/expenses" className="text-sm text-primary font-medium hover:underline flex items-center gap-1">
              View all
              <svg className="icon-xs" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
          {recentExpenses.length === 0 ? (
            <div className="empty-state py-12">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <svg className="icon-xl" style={{ color: 'var(--primary)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <p className="empty-state-title">No expenses yet</p>
              <p className="empty-state-text">Start tracking your expenses by adding your first transaction</p>
              <Link to="/expenses" className="btn-primary mt-4"><PlusIcon className="icon-sm" /> Add Expense</Link>
            </div>
          ) : (
            <div className="space-y-1">
              {recentExpenses.map((expense, index) => {
                const category = categories.find(c => c.id === expense.categoryId);
                const expenseTags = tags.filter(t => expense.tagIds.includes(t.id));
                return (
                  <div key={expense.id} className="expense-row group animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: category?.color + '20' }}>
                      <span className="text-xl">{category?.icon || '📦'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{expense.description}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {category && (
                          <span className="text-xs font-medium px-2.5 py-0.5 rounded-full" style={{ backgroundColor: category.color + '20', color: category.color }}>
                            {category.name}
                          </span>
                        )}
                        {expenseTags.slice(0, 2).map(tag => (
                          <span key={tag.id} className="tag-chip" style={{ backgroundColor: tag.color + '20', borderColor: tag.color + '40', color: tag.color }}>
                            {tag.name}
                          </span>
                        ))}
                        {expenseTags.length > 2 && (
                          <span className="tag-chip text-dim">+{expenseTags.length - 2}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-lg">₹{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                      <p className="text-xs text-dim">{new Date(expense.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', weekday: 'short' })}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Top Categories</h2>
          </div>
          {categoryBreakdown.length === 0 ? (
            <div className="empty-state py-8">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center mx-auto mb-3">
                <TargetIcon className="icon-lg" style={{ color: 'var(--warning)' }} />
              </div>
              <p className="empty-state-title text-base">No category data</p>
              <p className="empty-state-text text-sm">Add expenses with categories to see breakdown</p>
            </div>
          ) : (
            <div className="space-y-3">
              {categoryBreakdown.map(({ category, amount }, index) => (
                category && (
                  <div key={category.id} className="group animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: category.color + '20' }}>
                        <span className="text-lg">{category.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{category.name}</p>
                        <div className="h-2 bg-border rounded-full overflow-hidden mt-1">
                          <div className="h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${(amount / stats.total) * 100}%`, backgroundColor: category.color }} />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold" style={{ color: category.color }}>₹{amount.toLocaleString('en-IN')}</span>
                      <span className="text-dim">{((amount / stats.total) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      </div>

      {expenses.length > 0 && (
        <div className="mt-6 card p-5 animate-fade-in">
          <h2 className="section-title mb-4">Daily Spending This Month</h2>
          <div className="h-40 flex items-end justify-center gap-1.5 px-2">
            {dailySpending.map(({ date, amount }) => (
              <div key={date} className="flex-1 max-w-[36px] flex flex-col items-center">
                <div
                  className="w-full chart-bar rounded-t"
                  style={{
                    height: `${(amount / maxDaily) * 100}%`,
                    background: 'linear-gradient(180deg, var(--primary-light), var(--primary))',
                    minHeight: amount > 0 ? '4px' : '0',
                  }}
                />
                <span className="text-xs text-dim mt-2 whitespace-nowrap">
                  {new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
            {dailySpending.slice(-7).map(({ date, amount }) => (
              <div key={date} className="p-3 bg-bg rounded-lg text-center border">
                <p className="text-xs text-dim">{new Date(date).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit' })}</p>
                <p className="font-semibold">₹{amount.toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
}