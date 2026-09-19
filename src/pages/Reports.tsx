import { useState, useMemo } from 'react';
import { useKhata } from '../context/useKhata';
import { Layout } from '../components/Layout';
import { formatMonth, getMonthKey, getMonthRange } from '../utils/date';
import { ChevronLeftIcon, ChevronRightIcon, DownloadIcon, TrendingUpIcon, ArrowDownIcon, PieChartIcon, BarChartIcon } from '../components/Icons';

export function Reports() {
  const { expenses, categories, tags } = useKhata();
  const currentMonth = getMonthKey(new Date());
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const monthExpenses = useMemo(() => {
    const { start, end } = getMonthRange(selectedMonth);
    return expenses.filter(e => {
      const d = new Date(e.date);
      return d >= start && d <= end;
    });
  }, [expenses, selectedMonth]);

  const total = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const daysInMonth = new Date(parseInt(selectedMonth.split('-')[0]), parseInt(selectedMonth.split('-')[1]), 0).getDate();
  const dailyAvg = daysInMonth > 0 ? total / daysInMonth : 0;
  const expenseCount = monthExpenses.length;

  const byCategory = useMemo(() => {
    const result: Record<string, number> = {};
    monthExpenses.forEach(e => { result[e.categoryId] = (result[e.categoryId] || 0) + e.amount; });
    return result;
  }, [monthExpenses]);

  const byTag = useMemo(() => {
    const result: Record<string, number> = {};
    monthExpenses.forEach(e => { e.tagIds.forEach(tagId => { result[tagId] = (result[tagId] || 0) + e.amount; }); });
    return result;
  }, [monthExpenses]);

  const dailyTotals = useMemo(() => {
    const result: Record<string, number> = {};
    monthExpenses.forEach(e => { const day = e.date.split('T')[0]; result[day] = (result[day] || 0) + e.amount; });
    return result;
  }, [monthExpenses]);

  const sortedCategories = Object.entries(byCategory)
    .sort((a, b) => b[1] - a[1])
    .map(([id, amount]) => ({ category: categories.find(c => c.id === id), amount }));

  const sortedTags = Object.entries(byTag)
    .sort((a, b) => b[1] - a[1])
    .map(([id, amount]) => ({ tag: tags.find(t => t.id === id), amount }));

  const dailyData = Object.entries(dailyTotals)
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .map(([date, amount]) => ({ date, amount }));

  const maxDaily = Math.max(...Object.values(dailyTotals), 1);

  const prevMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    setSelectedMonth(getMonthKey(new Date(year, month - 2, 1)));
  };
  const nextMonth = () => {
    if (selectedMonth >= currentMonth) return;
    const [year, month] = selectedMonth.split('-').map(Number);
    setSelectedMonth(getMonthKey(new Date(year, month, 1)));
  };

  return (
    <Layout
      title="Reports"
      subtitle={`Analysis for ${formatMonth(selectedMonth + '-01')}`}
      headerActions={
        <button className="btn-secondary icon-btn" title="Export report" aria-label="Export report">
          <DownloadIcon className="icon-sm" />
        </button>
      }
    >
      <div className="flex items-center justify-between mb-6">
        <button className="btn-secondary icon-btn" onClick={prevMonth} aria-label="Previous month">
          <ChevronLeftIcon className="icon" />
        </button>
        <div className="flex items-center gap-4">
          <span className="font-semibold text-lg min-w-[200px] text-center">{formatMonth(selectedMonth + '-01')}</span>
        </div>
        <button className="btn-secondary icon-btn" onClick={nextMonth} disabled={selectedMonth >= currentMonth} aria-label="Next month">
          <ChevronRightIcon className="icon" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="stat-card group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wide">Total Spent</p>
              <p className="text-2xl font-bold mt-1">₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--primary)20, var(--purple)20)' }}>
              <TrendingUpIcon className="icon" style={{ color: 'var(--primary)' }} />
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />
        </div>
        <div className="stat-card group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wide">Daily Average</p>
              <p className="text-2xl font-bold mt-1">₹{dailyAvg.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--success)20, var(--cyan)20)' }}>
              <ArrowDownIcon className="icon" style={{ color: 'var(--success)' }} />
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-success/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />
        </div>
        <div className="stat-card group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wide">Transactions</p>
              <p className="text-2xl font-bold mt-1">{expenseCount}</p>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--purple)20, var(--pink)20)' }}>
              <BarChartIcon className="icon" style={{ color: 'var(--purple)' }} />
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-purple/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />
        </div>
        <div className="stat-card group">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wide">Categories Used</p>
              <p className="text-2xl font-bold mt-1">{sortedCategories.length}</p>
            </div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--warning)20, var(--orange)20)' }}>
              <PieChartIcon className="icon" style={{ color: 'var(--warning)' }} />
            </div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-warning/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Spending by Category</h2>
            <BarChartIcon className="icon text-muted" />
          </div>
          {sortedCategories.length === 0 ? (
            <div className="empty-state py-8"><p className="empty-state-text">No category data</p></div>
          ) : (
            <div className="space-y-3">
              {sortedCategories.map(({ category, amount }, index) => (
                category && (
                  <div key={category.id} className="group animate-slide-up" style={{ animationDelay: `${index * 40}ms` }}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: category.color + '20' }}>
                        <span className="text-lg">{category.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{category.name}</p>
                        <div className="h-2 bg-border rounded-full overflow-hidden mt-1">
                          <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${(amount / total) * 100}%`, backgroundColor: category.color }} />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold" style={{ color: category.color }}>₹{amount.toLocaleString('en-IN')}</span>
                      <span className="text-dim">{((amount / total) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="section-title">Spending by Tag</h2>
            <PieChartIcon className="icon text-muted" />
          </div>
          {sortedTags.length === 0 ? (
            <div className="empty-state py-8"><p className="empty-state-text">No tag data</p></div>
          ) : (
            <div className="space-y-3">
              {sortedTags.map(({ tag, amount }, index) => (
                tag && (
                  <div key={tag.id} className="group animate-slide-up" style={{ animationDelay: `${index * 40}ms` }}>
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-lg flex-shrink-0" style={{ backgroundColor: tag.color + '20' }}>
                        <div className="w-6 h-6 rounded m-auto" style={{ backgroundColor: tag.color }}></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{tag.name}</p>
                        <div className="h-2 bg-border rounded-full overflow-hidden mt-1">
                          <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${(amount / total) * 100}%`, backgroundColor: tag.color }} />
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold" style={{ color: tag.color }}>₹{amount.toLocaleString('en-IN')}</span>
                      <span className="text-dim">{((amount / total) * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                )
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="section-title">Daily Breakdown</h2>
          <TrendingUpIcon className="icon text-muted" />
        </div>
        <div className="h-48 flex items-end justify-center gap-2 px-2">
          {dailyData.length === 0 ? (
            <div className="w-full empty-state py-8"><p className="empty-state-text">No daily data</p></div>
          ) : (
            dailyData.map(({ date, amount }, index) => (
              <div key={date} className="flex-1 max-w-[40px] flex flex-col items-center">
                <div
                  className="w-full chart-bar rounded-t"
                  style={{
                    height: `${(amount / maxDaily) * 100}%`,
                    background: 'linear-gradient(180deg, var(--primary-light), var(--primary))',
                    minHeight: amount > 0 ? '4px' : '0',
                    animationDelay: `${index * 30}ms`,
                  }}
                />
                <span className="text-xs text-dim mt-2 whitespace-nowrap">
                  {new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </span>
              </div>
            ))
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
          {dailyData.slice(-7).map(({ date, amount }) => (
            <div key={date} className="p-3 bg-bg rounded-lg text-center border">
              <p className="text-xs text-dim">{new Date(date).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit' })}</p>
              <p className="font-semibold">₹{amount.toLocaleString('en-IN')}</p>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
