import { useMemo, useState } from 'react';
import type { Category, Tag } from '../types';
import { useKhata } from '../context/useKhata';
import { Layout } from '../components/Layout';
import { formatMonth, getDateKey, getMonthKey, getMonthRange } from '../utils/date';
import { isCredit, spendingAmount, totalAmountLabel } from '../utils/transactions';
import { ArrowRightIcon, BarChartIcon, CalendarIcon, DownloadIcon, PieChartIcon, TrendingUpIcon } from '../components/Icons';

type ReportPeriod = 'all' | 'custom' | string;

type PieSlice = {
  id: string;
  name: string;
  amount: number;
  netAmount?: number;
  color: string;
  icon?: string;
};

const formatRupees = (amount: number) => `${amount < 0 ? '−' : ''}₹${Math.abs(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

function pieBackground(slices: PieSlice[]): string {
  const total = slices.reduce((sum, slice) => sum + slice.amount, 0);
  if (!total) return 'conic-gradient(var(--border) 0deg 360deg)';

  let cursor = 0;
  const segments = slices.map(slice => {
    const start = cursor;
    cursor += (slice.amount / total) * 100;
    return `${slice.color} ${start}% ${cursor}%`;
  });
  return `conic-gradient(${segments.join(', ')})`;
}

function PieBreakdown({
  title,
  slices,
  centerValue,
  centerLabel,
  emptyMessage,
}: {
  title: string;
  slices: PieSlice[];
  centerValue: string;
  centerLabel: string;
  emptyMessage: string;
}) {
  const visibleSlices = slices.filter(slice => slice.amount > 0);
  const sliceTotal = visibleSlices.reduce((sum, slice) => sum + slice.amount, 0);

  return (
    <section className="card p-5 report-pie-card">
      <h2 className="section-title mb-5">{title}</h2>
      {visibleSlices.length === 0 ? (
        <div className="empty-state report-pie-empty"><p className="empty-state-text">{emptyMessage}</p></div>
      ) : (
        <div className="report-pie-layout">
          <div
            className="report-pie"
            style={{ background: pieBackground(visibleSlices) }}
            role="img"
            aria-label={`${title} pie chart`}
          >
            <div className="report-pie-center">
              <strong>{centerValue}</strong>
              <span>{centerLabel}</span>
            </div>
          </div>
          <div className="report-pie-legend">
            {visibleSlices.map(slice => (
              <div key={slice.id} className="report-pie-legend-item">
                <span className="report-pie-dot" style={{ backgroundColor: slice.color }} />
                <span className="report-pie-name">{slice.icon && `${slice.icon} `}{slice.name}</span>
                <span className="report-pie-amount">
                  {formatRupees(slice.netAmount ?? slice.amount)} · {((slice.amount / sliceTotal) * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

function getMonthOptions(expenses: { date: string }[], currentMonth: string): string[] {
  const recordedMonths = expenses.map(expense => getMonthKey(expense.date)).sort();
  const earliestMonth = recordedMonths[0] || currentMonth;
  const [startYear, startMonth] = earliestMonth.split('-').map(Number);
  const [currentYear, currentMonthNumber] = currentMonth.split('-').map(Number);
  const cursor = new Date(currentYear, currentMonthNumber - 1, 1);
  const start = new Date(startYear, startMonth - 1, 1);
  const months: string[] = [];

  while (cursor >= start) {
    months.push(getMonthKey(cursor));
    cursor.setMonth(cursor.getMonth() - 1);
  }
  return months;
}

function formatRangeDate(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function Reports() {
  const { expenses, categories, tags } = useKhata();
  const currentMonth = getMonthKey(new Date());
  const today = getDateKey(new Date());
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('all');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const monthOptions = useMemo(() => getMonthOptions(expenses, currentMonth), [expenses, currentMonth]);
  const isCustomView = selectedPeriod === 'custom';
  const isMonthlyView = selectedPeriod !== 'all' && !isCustomView;
  const hasValidCustomRange = Boolean(
    customStartDate
    && customEndDate
    && customStartDate <= customEndDate
    && customEndDate <= today,
  );
  const isFilteredView = isMonthlyView || isCustomView;
  const periodLabel = isMonthlyView
    ? formatMonth(`${selectedPeriod}-01`)
    : hasValidCustomRange
      ? `${formatRangeDate(customStartDate)} – ${formatRangeDate(customEndDate)}`
      : isCustomView
        ? 'Custom range'
        : 'All time';

  const applyCurrentMonthRange = () => {
    setCustomStartDate(`${currentMonth}-01`);
    setCustomEndDate(today);
  };

  const handlePeriodChange = (period: string) => {
    setSelectedPeriod(period);
    if (period === 'custom' && (!customStartDate || !customEndDate)) applyCurrentMonthRange();
  };

  const handleCustomStartDateChange = (date: string) => {
    const safeDate = date > today ? today : date;
    setCustomStartDate(safeDate);
    if (safeDate && customEndDate && safeDate > customEndDate) setCustomEndDate(safeDate);
  };

  const handleCustomEndDateChange = (date: string) => {
    const safeDate = date > today ? today : date;
    setCustomEndDate(safeDate);
    if (safeDate && customStartDate && safeDate < customStartDate) setCustomStartDate(safeDate);
  };

  const reportExpenses = useMemo(() => {
    if (selectedPeriod === 'all') return expenses;

    if (isCustomView) {
      if (!hasValidCustomRange) return [];
      return expenses.filter(expense => {
        const expenseDate = expense.date.split('T')[0];
        return expenseDate >= customStartDate && expenseDate <= customEndDate;
      });
    }

    const { start, end } = getMonthRange(selectedPeriod);
    return expenses.filter(expense => {
      const date = new Date(expense.date);
      return date >= start && date <= end;
    });
  }, [customEndDate, customStartDate, expenses, hasValidCustomRange, isCustomView, selectedPeriod]);

  const debitTotal = reportExpenses
    .filter(expense => !isCredit(expense))
    .reduce((sum, expense) => sum + expense.amount, 0);
  const creditTotal = reportExpenses
    .filter(isCredit)
    .reduce((sum, expense) => sum + expense.amount, 0);
  const netTotal = reportExpenses.reduce((sum, expense) => sum + spendingAmount(expense), 0);

  const categorySlices = useMemo(() => {
    const totals: Record<string, number> = {};
    reportExpenses.forEach(expense => {
      totals[expense.categoryId] = (totals[expense.categoryId] || 0) + spendingAmount(expense);
    });
    return Object.entries(totals)
      .map(([id, amount]) => ({ category: categories.find(category => category.id === id), amount }))
      .filter((item): item is { category: Category; amount: number } => Boolean(item.category) && item.amount !== 0)
      .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount))
      .map(({ category, amount }) => ({ id: category.id, name: category.name, icon: category.icon, color: category.color, amount: Math.abs(amount), netAmount: amount }));
  }, [reportExpenses, categories]);
  const categoryNetTotal = categorySlices.reduce((sum, category) => sum + (category.netAmount ?? category.amount), 0);

  const tagBreakdown = useMemo(() => {
    const totals: Record<string, number> = {};
    reportExpenses.filter(expense => !isCredit(expense)).forEach(expense => {
      expense.tagIds.forEach(tagId => { totals[tagId] = (totals[tagId] || 0) + expense.amount; });
    });
    return Object.entries(totals)
      .map(([id, amount]) => ({ tag: tags.find(tag => tag.id === id), amount }))
      .filter((item): item is { tag: Tag; amount: number } => Boolean(item.tag))
      .sort((a, b) => b.amount - a.amount);
  }, [reportExpenses, tags]);

  const dailyData = useMemo(() => {
    if (!isFilteredView || (isCustomView && !hasValidCustomRange)) return [];
    const totals: Record<string, number> = {};
    reportExpenses.forEach(expense => {
      const day = expense.date.split('T')[0];
      totals[day] = (totals[day] || 0) + spendingAmount(expense);
    });
    return Object.entries(totals)
      .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
      .map(([date, amount]) => ({ date, amount }));
  }, [hasValidCustomRange, isCustomView, isFilteredView, reportExpenses]);
  const maxDaily = Math.max(...dailyData.map(day => Math.abs(day.amount)), 1);

  const cashFlowSlices: PieSlice[] = [
    { id: 'debits', name: 'Debits', amount: debitTotal, color: 'var(--danger)' },
    { id: 'credits', name: 'Credits', amount: creditTotal, color: 'var(--success)' },
  ];

  return (
    <Layout
      title="Reports"
      subtitle={`${periodLabel} overview`}
      headerActions={
        <button className="btn-secondary icon-btn" title="Export report" aria-label="Export report">
          <DownloadIcon className="icon-sm" />
        </button>
      }
    >
      <div className="report-toolbar mb-6">
        <div>
          <h2 className="section-title">Spending overview</h2>
          <p className="text-sm text-muted mt-1">
            {isMonthlyView
              ? `Monthly spend for ${periodLabel}`
              : isCustomView
                ? hasValidCustomRange
                  ? `Spending from ${periodLabel}`
                  : 'Choose a start and end date to view spending.'
                : 'Your complete spending history'}
          </p>
        </div>
        <div className="report-period-controls">
          <label className="report-period-select">
            <span>View period</span>
            <select className="select" value={selectedPeriod} onChange={event => handlePeriodChange(event.target.value)}>
              <option value="all">All time</option>
              <option value="custom">Custom range</option>
              {monthOptions.map(month => <option key={month} value={month}>{formatMonth(`${month}-01`)}</option>)}
            </select>
          </label>
          {isCustomView && (
            <div className="report-custom-range" role="group" aria-label="Custom date range">
              <div className="report-range-heading">
                <div className="report-range-title">
                  <span className="report-range-icon"><CalendarIcon className="icon-sm" /></span>
                  <div><strong>Custom date range</strong><span>Choose the first and last day to include</span></div>
                </div>
                <button type="button" className="report-range-shortcut" onClick={applyCurrentMonthRange}>This month</button>
              </div>
              <div className="report-date-fields">
                <label className="report-date-input">
                  <span>Start date</span>
                  <input
                    type="date"
                    className="input"
                    value={customStartDate}
                    max={customEndDate || today}
                    onChange={event => handleCustomStartDateChange(event.target.value)}
                  />
                </label>
                <ArrowRightIcon className="report-date-arrow" />
                <label className="report-date-input">
                  <span>End date</span>
                  <input
                    type="date"
                    className="input"
                    value={customEndDate}
                    min={customStartDate || undefined}
                    max={today}
                    onChange={event => handleCustomEndDateChange(event.target.value)}
                  />
                </label>
              </div>
              <p className="report-range-help">Both dates are included. Future dates are unavailable.</p>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="stat-card group">
          <div className="flex items-center justify-between">
            <div><p className="text-xs font-medium text-muted uppercase tracking-wide">Net total</p><p className="text-2xl font-bold mt-1">{totalAmountLabel(netTotal)}</p></div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--primary)20, var(--purple)20)' }}><TrendingUpIcon className="icon" style={{ color: 'var(--primary)' }} /></div>
          </div>
        </div>
        <div className="stat-card group">
          <div className="flex items-center justify-between">
            <div><p className="text-xs font-medium text-muted uppercase tracking-wide">Debits</p><p className="text-2xl font-bold mt-1">{formatRupees(debitTotal)}</p></div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--danger)20' }}><BarChartIcon className="icon" style={{ color: 'var(--danger)' }} /></div>
          </div>
        </div>
        <div className="stat-card group">
          <div className="flex items-center justify-between">
            <div><p className="text-xs font-medium text-muted uppercase tracking-wide">Credits</p><p className="text-2xl font-bold mt-1 text-success">+{formatRupees(creditTotal)}</p></div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'var(--success)20' }}><TrendingUpIcon className="icon" style={{ color: 'var(--success)' }} /></div>
          </div>
        </div>
        <div className="stat-card group">
          <div className="flex items-center justify-between">
            <div><p className="text-xs font-medium text-muted uppercase tracking-wide">Transactions</p><p className="text-2xl font-bold mt-1">{reportExpenses.length}</p></div>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, var(--purple)20, var(--pink)20)' }}><PieChartIcon className="icon" style={{ color: 'var(--purple)' }} /></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <PieBreakdown title="Cash flow" slices={cashFlowSlices} centerValue={totalAmountLabel(netTotal)} centerLabel="net total" emptyMessage="No credits or debits in this period." />
        <PieBreakdown title="Net category movement" slices={categorySlices} centerValue={formatRupees(categoryNetTotal)} centerLabel="net category total" emptyMessage="No category activity in this period." />
      </div>

      {tagBreakdown.length > 0 && (
        <section className="card p-5 mb-6">
          <div className="flex items-center justify-between mb-4"><h2 className="section-title">Spending by tag</h2><PieChartIcon className="icon text-muted" /></div>
          <div className="report-tag-list">
            {tagBreakdown.map(({ tag, amount }) => (
              <div key={tag.id} className="report-tag-row">
                <span className="report-pie-dot" style={{ backgroundColor: tag.color }} />
                <span className="font-medium">{tag.name}</span>
                <span className="text-muted">{formatRupees(amount)} · {((amount / Math.max(debitTotal, 1)) * 100).toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {isFilteredView && (
        <section className="card p-5">
          <div className="flex items-center justify-between mb-4"><h2 className="section-title">Daily net</h2><TrendingUpIcon className="icon text-muted" /></div>
          {dailyData.length === 0 ? (
            <div className="empty-state report-pie-empty"><p className="empty-state-text">No transactions in {periodLabel}.</p></div>
          ) : (
            <>
              <div className="h-48 flex items-end justify-center gap-2 px-2">
                {dailyData.map(({ date, amount }, index) => (
                  <div key={date} className="flex-1 max-w-[40px] flex flex-col items-center">
                    <div className="w-full chart-bar rounded-t" style={{ height: `${(Math.abs(amount) / maxDaily) * 100}%`, background: amount < 0 ? 'linear-gradient(180deg, #34d399, var(--success))' : 'linear-gradient(180deg, var(--primary-light), var(--primary))', minHeight: amount !== 0 ? '4px' : '0', animationDelay: `${index * 30}ms` }} />
                    <span className="text-xs text-dim mt-2 whitespace-nowrap">{new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
                {dailyData.slice(-7).map(({ date, amount }) => <div key={date} className="p-3 bg-bg rounded-lg text-center border"><p className="text-xs text-dim">{new Date(date).toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit' })}</p><p className={`font-semibold ${amount < 0 ? 'text-success' : ''}`}>{totalAmountLabel(amount)}</p></div>)}
              </div>
            </>
          )}
        </section>
      )}
    </Layout>
  );
}
