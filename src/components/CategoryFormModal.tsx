import { useState, useEffect } from 'react';
import { useKhata } from '../context/useKhata';
import type { Category } from '../types';
import { XIcon } from '../components/Icons';

interface CategoryFormModalProps {
  initialData?: Category | null;
  categories: Category[];
  onClose: () => void;
}

const getInitialState = (initialData?: Category | null) => ({
  name: initialData?.name || '',
  icon: initialData?.icon || '📦',
  color: initialData?.color || '#6B7280',
});

export function CategoryFormModal({ initialData, categories, onClose }: CategoryFormModalProps) {
  const { addCategory } = useKhata();
  const isEditing = !!initialData;

  const [name, setName] = useState(() => getInitialState(initialData).name);
  const [icon, setIcon] = useState(() => getInitialState(initialData).icon);
  const [color, setColor] = useState(() => getInitialState(initialData).color);
  const [error, setError] = useState('');

  useEffect(() => {
    setName(getInitialState(initialData).name);
    setIcon(getInitialState(initialData).icon);
    setColor(getInitialState(initialData).color);
    setError('');
  }, [initialData]);

  const validate = () => {
    if (!name.trim()) { setError('Name is required'); return false; }
    const exists = categories.some(c => c.name.toLowerCase() === name.trim().toLowerCase() && c.id !== initialData?.id);
    if (exists) { setError('A category with this name already exists'); return false; }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const data = { name: name.trim(), icon, color };
    if (isEditing && initialData) {
      // Note: In a real app, we'd update the category in storage
      // For now, we'll just call addCategory which creates new
      // You'd need to add updateCategory to storage/context
    } else {
      addCategory(data);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="category-modal-title">
      <div className="modal max-w-md" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="category-modal-title" className="modal-title">{isEditing ? 'Edit Category' : 'New Category'}</h2>
          <button className="modal-close icon-btn" onClick={onClose}><XIcon className="icon" /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body space-y-4" id="category-form">
          <div>
            <label className="label">Name <span className="text-danger">*</span></label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              className="input"
              placeholder="e.g., Food & Dining"
              required
              autoFocus
            />
            {error && <p className="form-error" role="alert"><XIcon className="icon-xs" /> {error}</p>}
          </div>

          <div>
            <label className="label">Icon</label>
            <input
              type="text"
              value={icon}
              onChange={e => setIcon(e.target.value)}
              className="input"
              placeholder="📦"
              maxLength={2}
            />
            <p className="form-hint">Enter an emoji or symbol</p>
          </div>

          <div>
            <label className="label">Color</label>
            <div className="flex items-center gap-3 flex-wrap">
              <input
                type="color"
                value={color}
                onChange={e => setColor(e.target.value)}
                className="w-12 h-10 rounded-lg border cursor-pointer"
              />
              <div className="flex flex-wrap gap-2">
                {['#EF4444', '#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#06B6D4', '#6B7280', '#F97316', '#84CC16'].map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-lg border-2 transition-transform ${color === c ? 'scale-110 border-primary' : 'border-transparent hover:border-border-light'}`}
                    style={{ backgroundColor: c }}
                    aria-label={c}
                    aria-pressed={color === c}
                  />
                ))}
              </div>
            </div>
          </div>
        </form>

        <div className="modal-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
          <button type="submit" form="category-form" className="btn-primary" onClick={handleSubmit}>
            {isEditing ? 'Save Changes' : 'Create Category'}
          </button>
        </div>
      </div>
    </div>
  );
}