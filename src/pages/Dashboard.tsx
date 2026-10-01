import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useKhata } from '../context/useKhata';
import { formatDate, formatMonth, getDateKey, getMonthKey, getMonthRange } from '../utils/date';
import { isCredit, spendingAmount, totalAmountLabel, transactionAmountLabel } from '../utils/transactions';
import { Layout } from '../components/Layout';
import { CalendarIcon, PlusIcon, ReceiptIcon, TrendingUpIcon, ArrowDownIcon, ClockIcon, TargetIcon } from '../components/Icons';

const statCards = [
  { key: 'total', label: 'Net This Month', icon: TrendingUpIcon, color: '#3b82f6', gradient: 'from-blue-500 to-purple-500' },
  { key: 'dailyAvg', label: 'Average Net / Day', icon: ArrowDownIcon, color: '#10b981', gradient: 'from-emerald-500 to-teal-500' },
  { key: 'topCategory', label: 'Top Category', icon: TargetIcon, color: '#f59e0b', gradient: 'from-amber-500 to-orange-500' },
  { key: 'expenseCount', label: 'Transactions', icon: ClockIcon, color: '#8b5cf6', gradient: 'from-violet-500 to-pink-500' },
];

export function Dashboard() {
  const { expenses, categories, tags } = useKhata();
  const currentMonth = getMonthKey(new Date());
  const { end } = getMonthRange(currentMonth);
  const today = getDateKey(new Date());
  const [selectedDate, setSelectedDate] = useState(() => getDateKey(new Date()));

  const monthExpenses = expenses.filter(expense => {
    const date = expense.date.split('T')[0];
    return date >= `${currentMonth}-01` && date <= today;
  });

  const daysElapsed = Math.max(1, Math.min(new Date().getDate(), end.getDate()));

  const byCategory: Record<string, number> = {};
  monthExpenses.forEach(expense => {
    byCategory[expense.categoryId] = (byCategory[expense.categoryId] || 0) + spendingAmount(expense);
  });

  const categoryBreakdown = Object.entries(byCategory)
    .filter(([, amount]) => amount > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id, amount]) => ({ category: categories.find(category => category.id === id), amount }));

  const total = monthExpenses.reduce((sum, expense) => sum + spendingAmount(expense), 0);
  const dailyAvg = total / daysElapsed;
  const topCategoryEntry = categoryBreakdown[0];

  const stats = {
    total,
    dailyAvg,
    topCategory: topCategoryEntry?.category || null,
    topCategoryAmount: topCategoryEntry?.amount || 0,
    expenseCount: monthExpenses.length,
  };

  const recentExpenses = useMemo(() => {
    return [...expenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [expenses]);

  const byDay: Record<string, number> = {};
  monthExpenses.forEach(expense => {
    const day = expense.date.split('T')[0];
    byDay[day] = (byDay[day] || 0) + spendingAmount(expense);
  });
  const dailySpending = [];
  for (let i = 1; i <= daysElapsed; i++) {
    const date = `${end.getFullYear()}-${String(end.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    dailySpending.push({ date, amount: byDay[date] || 0 });
  }

  const selectedDayExpenses = monthExpenses
    .filter(expense => expense.date.split('T')[0] === selectedDate)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const selectedDayNet = selectedDayExpenses.reduce((sum, expense) => sum + spendingAmount(expense), 0);

  const maxDaily = Math.max(...dailySpending.map(day => Math.abs(day.amount)), 1);
  const categorySpendingTotal = categoryBreakdown.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Layout title="Dashboard" subtitle={`Overview for ${formatMonth(currentMonth + '-01')}`}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat, i) => {
          let value: string;
          if (i === 0) value = totalAmountLabel(stats.total);
          else if (i === 1) value = totalAmountLabel(stats.dailyAvg);
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
                      <p className={`font-semibold text-lg ${isCredit(expense) ? 'text-success' : 'text-danger'}`}>
                        {transactionAmountLabel(expense)}
                      </p>
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
                          <div className="h-full rounded-full transition-all duration-500 ease-out" style={{ width: `${(amount / Math.max(categorySpendingTotal, 1)) * 100}%`, backgroundColor: category.color }} />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold" style={{ color: category.color }}>₹{amount.toLocaleString('en-IN')}</span>
                      <span className="text-dim">{((amount / Math.max(categorySpendingTotal, 1)) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      </div>

      <section className="mt-6 card p-5 animate-fade-in">
        <div className="dashboard-daily-heading">
          <div>
            <h2 className="section-title">Daily Net This Month</h2>
            <p className="dashboard-daily-subtitle">Select any date to see the transactions recorded that day.</p>
          </div>
          <span className="dashboard-daily-period">{daysElapsed} {daysElapsed === 1 ? 'day' : 'days'} elapsed</span>
        </div>

        <div className="dashboard-daily-chart" role="list" aria-label="Daily net spending">
          {dailySpending.map(({ date, amount }) => (
            <button
              key={date}
              type="button"
              className={`dashboard-daily-bar ${selectedDate === date ? 'is-selected' : ''}`}
              onClick={() => setSelectedDate(date)}
              aria-pressed={selectedDate === date}
              aria-label={`View transactions for ${formatDate(date)}: ${totalAmountLabel(amount)}`}
            >
              <span
                className="dashboard-daily-bar-fill"
                style={{
                  height: `${(Math.abs(amount) / maxDaily) * 100}%`,
                  background: amount < 0
                    ? 'linear-gradient(180deg, #fb7185, var(--danger))'
                    : 'linear-gradient(180deg, var(--primary-light), var(--primary))',
                  minHeight: amount !== 0 ? '4px' : '0',
                }}
              />
              <span className="dashboard-daily-label">
                {new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
              </span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
          {dailySpending.slice(-7).map(({ date, amount }) => (
            <button
              key={date}
              type="button"
              className={`dashboard-day-summary ${selectedDate === date ? 'is-selected' : ''}`}
              onClick={() => setSelectedDate(date)}
              aria-pressed={selectedDate === date}
            >
              <p className="text-xs text-dim">{new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit' })}</p>
              <p className={`font-semibold ${amount < 0 ? 'text-success' : ''}`}>{totalAmountLabel(amount)}</p>
            </button>
          ))}
        </div>

        <section className="dashboard-selected-day" aria-live="polite">
          <div className="dashboard-selected-day-header">
            <div className="dashboard-selected-date">
              <span className="dashboard-selected-date-icon"><CalendarIcon className="icon-sm" /></span>
              <div>
                <p>Transactions on</p>
                <h3>{formatDate(selectedDate)}</h3>
              </div>
            </div>
            <div className="dashboard-selected-net">
              <span>Day net</span>
              <strong className={selectedDayNet < 0 ? 'text-success' : ''}>{totalAmountLabel(selectedDayNet)}</strong>
            </div>
          </div>

          {selectedDayExpenses.length === 0 ? (
            <div className="dashboard-selected-empty">
              <ReceiptIcon className="icon" />
              <p>No transactions recorded for this date.</p>
            </div>
          ) : (
            <div className="dashboard-selected-expenses">
              {selectedDayExpenses.map(expense => {
                const category = categories.find(item => item.id === expense.categoryId);
                const expenseTags = tags.filter(tag => expense.tagIds.includes(tag.id));
                return (
                  <div key={expense.id} className="dashboard-selected-expense">
                    <div className="dashboard-selected-expense-icon" style={{ backgroundColor: category?.color + '20' }}>
                      <span>{category?.icon || '📦'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{expense.description}</p>
                      <div className="dashboard-selected-expense-meta">
                        {category && <span style={{ color: category.color }}>{category.name}</span>}
                        {expenseTags.slice(0, 2).map(tag => <span key={tag.id}>{tag.name}</span>)}
                      </div>
                    </div>
                    <p className={`font-semibold ${isCredit(expense) ? 'text-success' : 'text-danger'}`}>
                      {transactionAmountLabel(expense)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </section>
    </Layout>
  );
}
