import { useState } from 'react';
import { useKhata } from '../context/useKhata';
import { Layout } from '../components/Layout';
import { CategoryFormModal } from '../components/CategoryFormModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { PlusIcon, EditIcon, TrashIcon, CheckIcon } from '../components/Icons';

export function Categories() {
  const { categories } = useKhata();
  const [editingCategory, setEditingCategory] = useState<typeof categories[0] | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<typeof categories[0] | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleEdit = (cat: typeof categories[0]) => setEditingCategory(cat);
  const handleDelete = (cat: typeof categories[0]) => setDeletingCategory(cat);
  const confirmDelete = () => { /* handled by context */ setDeletingCategory(null); };

  const defaultCategoryIds = ['food', 'transport', 'shopping', 'entertainment', 'health', 'utilities', 'education', 'other'];

  return (
    <Layout title="Categories" subtitle={`${categories.length} categories`}>
      <div className="flex justify-between items-center mb-6">
        <div></div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <PlusIcon className="icon-sm" /> Add Category
        </button>
      </div>

      {categories.length === 0 ? (
        <div className="card p-12 empty-state">
          <div className="w-16 h-16 rounded-2xl bg-purple-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="icon-xl" style={{ color: 'var(--purple)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
          </div>
          <h3 className="empty-state-title">No categories yet</h3>
          <p className="empty-state-text">Create your first category to start organizing expenses</p>
          <button className="btn-primary mt-4" onClick={() => setShowAddModal(true)}>
            <PlusIcon className="icon-sm" /> Add Category
          </button>
        </div>
      ) : (
        <div className="entity-grid">
          {categories.map((category, index) => {
            const isDefault = defaultCategoryIds.includes(category.id);
            return (
              <div key={category.id} className="card p-5 hover:shadow-lg transition-all duration-300 group animate-slide-up" style={{ animationDelay: `${index * 30}ms` }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 relative overflow-hidden" style={{ backgroundColor: category.color + '20' }}>
                    <span className="text-2xl relative z-10">{category.icon}</span>
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[var(--cat-color)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" style={{ '--cat-color': category.color } as React.CSSProperties} />
                  </div>
                  <div className="dropdown">
                    <button
                      className="icon-btn p-1 text-muted hover:text-danger"
                      aria-label={`More options for ${category.name}`}
                      aria-expanded={openMenuId === category.id}
                      onClick={() => setOpenMenuId(openMenuId === category.id ? null : category.id)}
                    >
                      <svg className="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                    </button>
                    {openMenuId === category.id && <div className="dropdown-menu">
                      {!isDefault && (
                        <>
                          <button className="dropdown-item w-full justify-start flex items-center gap-2" onClick={() => { handleEdit(category); setOpenMenuId(null); }}>
                            <EditIcon className="icon-sm" /> Edit
                          </button>
                          <button className="dropdown-item w-full justify-start flex items-center gap-2 danger" onClick={() => { handleDelete(category); setOpenMenuId(null); }}>
                            <TrashIcon className="icon-sm" /> Delete
                          </button>
                        </>
                      )}
                      {isDefault && (
                        <div className="px-3 py-2 text-xs text-dim flex items-center gap-2">
                          <CheckIcon className="icon-xs" style={{ color: 'var(--success)' }} />
                          Default category
                        </div>
                      )}
                    </div>}
                  </div>
                </div>

                <h3 className="font-semibold text-lg mb-1">{category.name}</h3>
                <p className="text-sm text-dim font-mono">ID: {category.id}</p>

                <div className="mt-4 flex items-center gap-3 text-xs text-dim">
                  <span className="flex items-center gap-1.5 px-2 py-1 rounded-full" style={{ backgroundColor: category.color + '20', color: category.color }}>
                    <span className="w-2.5 h-2.5 rounded-full"></span>
                    {category.color}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAddModal && (
        <CategoryFormModal
          categories={categories}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {editingCategory && (
        <CategoryFormModal
          initialData={editingCategory}
          categories={categories}
          onClose={() => setEditingCategory(null)}
        />
      )}

      {deletingCategory && (
        <DeleteConfirmModal
          itemName={deletingCategory.name}
          onConfirm={confirmDelete}
          onCancel={() => setDeletingCategory(null)}
        />
      )}
    </Layout>
  );
}
