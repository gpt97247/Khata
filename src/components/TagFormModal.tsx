import { useState, useEffect } from 'react';
import { useKhata } from '../context/useKhata';
import type { Tag } from '../types';
import { XIcon } from '../components/Icons';

interface TagFormModalProps {
  initialData?: Tag | null;
  tags: Tag[];
  onClose: () => void;
}

const getInitialState = (initialData?: Tag | null) => ({
  name: initialData?.name || '',
  color: initialData?.color || '#6B7280',
});

export function TagFormModal({ initialData, tags, onClose }: TagFormModalProps) {
  const { addTag } = useKhata();
  const isEditing = !!initialData;

  const [name, setName] = useState(() => getInitialState(initialData).name);
  const [color, setColor] = useState(() => getInitialState(initialData).color);
  const [error, setError] = useState('');

  useEffect(() => {
    setName(getInitialState(initialData).name);
    setColor(getInitialState(initialData).color);
    setError('');
  }, [initialData]);

  const validate = () => {
    if (!name.trim()) { setError('Name is required'); return false; }
    const exists = tags.some(t => t.name.toLowerCase() === name.trim().toLowerCase() && t.id !== initialData?.id);
    if (exists) { setError('A tag with this name already exists'); return false; }
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const data = { name: name.trim(), color };
    if (isEditing && initialData) {
      // Would need updateTag in storage/context
    } else {
      addTag(data);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="tag-modal-title">
      <div className="modal max-w-md" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 id="tag-modal-title" className="modal-title">{isEditing ? 'Edit Tag' : 'New Tag'}</h2>
          <button className="modal-close icon-btn" onClick={onClose}><XIcon className="icon" /></button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body space-y-4" id="tag-form">
          <div>
            <label className="label">Name <span className="text-danger">*</span></label>
            <input
              type="text"
              value={name}
              onChange={e => { setName(e.target.value); setError(''); }}
              className="input"
              placeholder="e.g., Essential"
              required
              autoFocus
            />
            {error && <p className="form-error" role="alert"><XIcon className="icon-xs" /> {error}</p>}
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
          <button type="submit" form="tag-form" className="btn-primary" onClick={handleSubmit}>
            {isEditing ? 'Save Changes' : 'Create Tag'}
          </button>
        </div>
      </div>
    </div>
  );
}