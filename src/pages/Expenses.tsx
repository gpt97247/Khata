import React, { useState, useMemo } from 'react';
import { useKhata } from '../context/useKhata';
import { Layout } from '../components/Layout';
import { ExpenseFormModal } from '../components/ExpenseFormModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { formatDate } from '../utils/date';
import {
  PlusIcon, SearchIcon, FilterIcon, EditIcon, TrashIcon,
  CreditCardIcon,
  MoreVerticalIcon, XIcon, ChevronUpIcon, ChevronDownIcon
} from '../components/Icons';

export function Expenses() {
  const { expenses, categories, tags, removeExpense } = useKhata();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [selectedTag, setSelectedTag] = useState<string | 'all'>('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [editingExpense, setEditingExpense] = useState<typeof expenses[0] | null>(null);
  const [deletingExpense, setDeletingExpense] = useState<typeof expenses[0] | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });

  const filteredExpenses = useMemo(() => {
    return expenses.filter(expense => {
      if (search && !expense.description.toLowerCase().includes(search.toLowerCase())) return false;
      if (selectedCategory !== 'all' && expense.categoryId !== selectedCategory) return false;
      if (selectedTag !== 'all' && !expense.tagIds.includes(selectedTag)) return false;
      if (dateRange.start && new Date(expense.date) < new Date(dateRange.start)) return false;
      if (dateRange.end && new Date(expense.date) > new Date(dateRange.end)) return false;
      return true;
    });
  }, [expenses, search, selectedCategory, selectedTag, dateRange]);

  const sortedExpenses = useMemo(() => {
    return [...filteredExpenses].sort((a, b) => {
      let aVal = a[sortConfig.key as keyof typeof a];
      let bVal = b[sortConfig.key as keyof typeof b];
      if (sortConfig.key === 'date') {
        aVal = new Date(a.date).getTime();
        bVal = new Date(b.date).getTime();
      }
      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredExpenses, sortConfig]);

  const groupedExpenses = useMemo(() => {
    const grouped: Record<string, typeof expenses> = {};
    sortedExpenses.forEach(expense => {
      const key = expense.date.split('T')[0];
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(expense);
    });
    return grouped;
  }, [sortedExpenses]);

  const sortedDates = useMemo(() => Object.keys(groupedExpenses).sort((a, b) => new Date(b).getTime() - new Date(a).getTime()), [groupedExpenses]);

  const totalAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  const handleEdit = (expense: typeof expenses[0]) => {
    setEditingExpense(expense);
  };

  const handleDelete = (expense: typeof expenses[0]) => {
    setDeletingExpense(expense);
  };

  const confirmDelete = () => {
    if (deletingExpense) {
      removeExpense(deletingExpense.id);
      setDeletingExpense(null);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedTag('all');
    setDateRange({ start: '', end: '' });
  };

  const hasActiveFilters = search || selectedCategory !== 'all' || selectedTag !== 'all' || dateRange.start || dateRange.end;

  const handleSort = (key: string) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  return (
    <Layout title="Expenses" subtitle={`${filteredExpenses.length} transactions • ₹${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1 max-w-xs">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 icon-sm text-dim" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input pl-10 pr-4"
              aria-label="Search expenses"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              className={`btn-secondary ${showFilters ? 'bg-primary/10 border-primary text-primary' : ''}`}
              onClick={() => setShowFilters(!showFilters)}
              aria-expanded={showFilters}
            >
              <FilterIcon className="icon-sm" />
              <span className="hidden sm:inline">Filters</span>
              {hasActiveFilters && <span className="badge badge-primary ml-1">{[search, selectedCategory !== 'all', selectedTag !== 'all', dateRange.start, dateRange.end].filter(Boolean).length}</span>}
            </button>

            <button className="btn-primary" onClick={() => setShowAddModal(true)}>
              <PlusIcon className="icon-sm" />
              <span className="hidden sm:inline">Add Expense</span>
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="card p-4 animate-slide-down">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="flex-1">
                <label className="label">Category</label>
                <select
                  value={selectedCategory}
                  onChange={e => setSelectedCategory(e.target.value)}
                  className="select"
                >
                  <option value="all">All Categories</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="label">Tag</label>
                <select
                  value={selectedTag}
                  onChange={e => setSelectedTag(e.target.value)}
                  className="select"
                >
                  <option value="all">All Tags</option>
                  {tags.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="label">Date Range</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={e => setDateRange(d => ({ ...d, start: e.target.value }))}
                    className="input"
                    placeholder="From"
                  />
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={e => setDateRange(d => ({ ...d, end: e.target.value }))}
                    className="input"
                    placeholder="To"
                  />
                </div>
              </div>
            </div>
            {hasActiveFilters && (
              <button className="btn-secondary text-sm" onClick={clearFilters}>
                <XIcon className="icon-sm" /> Clear Filters
              </button>
            )}
          </div>
        )}

        {filteredExpenses.length === 0 ? (
          <div className="card p-12 empty-state">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--primary)' + '20' }}>
              <CreditCardIcon className="icon-xl" style={{ color: 'var(--primary)' }} />
            </div>
            <h3 className="empty-state-title">No expenses found</h3>
            <p className="empty-state-text">
              {hasActiveFilters ? 'Try adjusting your filters or search terms' : 'Start tracking your expenses by adding your first transaction'}
            </p>
            <button className="btn-primary mt-4" onClick={() => setShowAddModal(true)}>
              <PlusIcon className="icon-sm" /> Add Expense
            </button>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th className="w-[60px] cursor-pointer hover:bg-hover" onClick={() => handleSort('date')}>
                      <div className="flex items-center gap-1">
                        Date
                        {sortConfig.key === 'date' && (sortConfig.direction === 'desc' ? <ChevronDownIcon className="icon-xs text-primary" /> : <ChevronUpIcon className="icon-xs text-primary" />)}
                      </div>
                    </th>
                    <th className="cursor-pointer hover:bg-hover" onClick={() => handleSort('description')}>
                      <div className="flex items-center gap-1">
                        Description
                        {sortConfig.key === 'description' && (sortConfig.direction === 'desc' ? <ChevronDownIcon className="icon-xs text-primary" /> : <ChevronUpIcon className="icon-xs text-primary" />)}
                      </div>
                    </th>
                    <th className="w-[160px]">Category</th>
                    <th className="w-[140px]">Tags</th>
                    <th className="w-[140px] text-right cursor-pointer hover:bg-hover" onClick={() => handleSort('amount')}>
                      <div className="flex items-center justify-end gap-1">
                        Amount
                        {sortConfig.key === 'amount' && (sortConfig.direction === 'desc' ? <ChevronDownIcon className="icon-xs text-primary" /> : <ChevronUpIcon className="icon-xs text-primary" />)}
                      </div>
                    </th>
                    <th className="w-[56px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedDates.map(dateKey => {
                    const dayExpenses = groupedExpenses[dateKey];
                    const dayTotal = dayExpenses.reduce((sum, e) => sum + e.amount, 0);
                    return (
                      <React.Fragment key={dateKey}>
                        <tr className="bg-bg/50">
                          <td className="font-medium text-muted whitespace-nowrap">{formatDate(dateKey)}</td>
                          <td colSpan={3} className="text-right font-medium text-muted">Day Total</td>
                          <td className="text-right font-semibold text-lg">₹{dayTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                          <td></td>
                        </tr>
                        {dayExpenses.map(expense => {
                          const category = categories.find(c => c.id === expense.categoryId);
                          const expenseTags = tags.filter(t => expense.tagIds.includes(t.id));
                          return (
                            <tr key={expense.id} className="hover:bg-hover transition-colors">
                              <td className="text-muted whitespace-nowrap">{new Date(expense.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</td>
                              <td>
                                <p className="font-medium truncate max-w-[300px]">{expense.description}</p>
                              </td>
                              <td>
                                {category && (
                                  <span className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: category.color + '20', color: category.color }}>
                                    <span className="text-sm">{category.icon}</span>
                                    {category.name}
                                  </span>
                                )}
                              </td>
                              <td>
                                <div className="flex flex-wrap gap-1">
                                  {expenseTags.slice(0, 3).map(tag => (
                                    <span key={tag.id} className="tag-chip" style={{ backgroundColor: tag.color + '20', borderColor: tag.color + '40', color: tag.color }}>
                                      {tag.name}
                                    </span>
                                  ))}
                                  {expenseTags.length > 3 && (
                                    <span className="tag-chip text-dim">+{expenseTags.length - 3}</span>
                                  )}
                                </div>
                              </td>
                              <td className="text-right font-semibold">₹{expense.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                              <td>
                                <div className="dropdown">
                                  <button
                                    className="icon-btn p-1"
                                    aria-label={`More options for ${expense.description}`}
                                    aria-expanded={openMenuId === expense.id}
                                    onClick={() => setOpenMenuId(openMenuId === expense.id ? null : expense.id)}
                                  >
                                    <MoreVerticalIcon className="icon-sm" />
                                  </button>
                                  {openMenuId === expense.id && <div className="dropdown-menu">
                                    <button className="dropdown-item w-full justify-start flex items-center gap-2" onClick={() => { handleEdit(expense); setOpenMenuId(null); }}>
                                      <EditIcon className="icon-sm" /> Edit
                                    </button>
                                    <button className="dropdown-item w-full justify-start flex items-center gap-2 danger" onClick={() => { handleDelete(expense); setOpenMenuId(null); }}>
                                      <TrashIcon className="icon-sm" /> Delete
                                    </button>
                                  </div>}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {showAddModal && (
          <ExpenseFormModal
            categories={categories}
            tags={tags}
            onClose={() => setShowAddModal(false)}
          />
        )}

        {editingExpense && (
          <ExpenseFormModal
            initialData={editingExpense}
            categories={categories}
            tags={tags}
            onClose={() => setEditingExpense(null)}
          />
        )}

        {deletingExpense && (
          <DeleteConfirmModal
            itemName={deletingExpense.description}
            onConfirm={confirmDelete}
            onCancel={() => setDeletingExpense(null)}
          />
        )}
      </div>
    </Layout>
  );
}
