import { useState } from 'react';
import { useKhata } from '../context/useKhata';
import { Layout } from '../components/Layout';
import { TagFormModal } from '../components/TagFormModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';
import { PlusIcon, EditIcon, TrashIcon, CheckIcon } from '../components/Icons';

export function Tags() {
  const { tags } = useKhata();
  const [editingTag, setEditingTag] = useState<typeof tags[0] | null>(null);
  const [deletingTag, setDeletingTag] = useState<typeof tags[0] | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const handleEdit = (tag: typeof tags[0]) => setEditingTag(tag);
  const handleDelete = (tag: typeof tags[0]) => setDeletingTag(tag);
  const confirmDelete = () => { setDeletingTag(null); };

  const defaultTagIds = ['essential', 'want', 'investment', 'emergency'];

  return (
    <Layout title="Tags" subtitle={`${tags.length} tags`}>
      <div className="flex justify-between items-center mb-6">
        <div></div>
        <button className="btn-primary" onClick={() => setShowAddModal(true)}>
          <PlusIcon className="icon-sm" /> Add Tag
        </button>
      </div>

      {tags.length === 0 ? (
        <div className="card p-12 empty-state">
          <div className="w-16 h-16 rounded-2xl bg-pink-500/10 flex items-center justify-center mx-auto mb-4">
            <svg className="icon-xl" style={{ color: 'var(--pink)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-5 5a2 2 0 01-2.828 0l-5-5a2 2 0 010-2.828L10.586 3.586A1.99 1.99 0 0112 3h5z" /></svg>
          </div>
          <h3 className="empty-state-title">No tags yet</h3>
          <p className="empty-state-text">Create tags to better organize and filter your expenses</p>
          <button className="btn-primary mt-4" onClick={() => setShowAddModal(true)}>
            <PlusIcon className="icon-sm" /> Add Tag
          </button>
        </div>
      ) : (
        <div className="entity-grid">
          {tags.map((tag, index) => {
            const isDefault = defaultTagIds.includes(tag.id);
            return (
              <div key={tag.id} className="card p-5 hover:shadow-lg transition-all duration-300 group animate-slide-up" style={{ animationDelay: `${index * 30}ms` }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 relative overflow-hidden" style={{ backgroundColor: tag.color + '20' }}>
                    <div className="w-8 h-8 rounded-lg relative z-10" style={{ backgroundColor: tag.color }}></div>
                    <div className="absolute inset-0 bg-gradient-to-br from-transparent via-[var(--tag-color)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" style={{ '--tag-color': tag.color } as React.CSSProperties} />
                  </div>
                  <div className="dropdown">
                    <button
                      className="icon-btn p-1 text-muted hover:text-danger"
                      aria-label={`More options for ${tag.name}`}
                      aria-expanded={openMenuId === tag.id}
                      onClick={() => setOpenMenuId(openMenuId === tag.id ? null : tag.id)}
                    >
                      <svg className="icon-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" /></svg>
                    </button>
                    {openMenuId === tag.id && <div className="dropdown-menu">
                      {!isDefault && (
                        <>
                          <button className="dropdown-item w-full justify-start flex items-center gap-2" onClick={() => { handleEdit(tag); setOpenMenuId(null); }}>
                            <EditIcon className="icon-sm" /> Edit
                          </button>
                          <button className="dropdown-item w-full justify-start flex items-center gap-2 danger" onClick={() => { handleDelete(tag); setOpenMenuId(null); }}>
                            <TrashIcon className="icon-sm" /> Delete
                          </button>
                        </>
                      )}
                      {isDefault && (
                        <div className="px-3 py-2 text-xs text-dim flex items-center gap-2">
                          <CheckIcon className="icon-xs" style={{ color: 'var(--success)' }} />
                          Default tag
                        </div>
                      )}
                    </div>}
                  </div>
                </div>

                <h3 className="font-semibold text-lg mb-1">{tag.name}</h3>
                <p className="text-sm text-dim font-mono">ID: {tag.id}</p>

                <div className="mt-4 flex items-center gap-3 text-xs text-dim">
                  <span className="flex items-center gap-1.5 px-2 py-1 rounded-full" style={{ backgroundColor: tag.color + '20', color: tag.color }}>
                    <span className="w-2.5 h-2.5 rounded-full"></span>
                    {tag.color}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAddModal && (
        <TagFormModal
          tags={tags}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {editingTag && (
        <TagFormModal
          initialData={editingTag}
          tags={tags}
          onClose={() => setEditingTag(null)}
        />
      )}

      {deletingTag && (
        <DeleteConfirmModal
          itemName={deletingTag.name}
          onConfirm={confirmDelete}
          onCancel={() => setDeletingTag(null)}
        />
      )}
    </Layout>
  );
}
