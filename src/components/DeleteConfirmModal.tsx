import { TrashIcon } from '../components/Icons';

interface DeleteConfirmModalProps {
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmModal({ itemName, onConfirm, onCancel }: DeleteConfirmModalProps) {
  return (
    <div className="modal-overlay" onClick={onCancel} role="dialog" aria-modal="true" aria-labelledby="delete-modal-title">
      <div className="modal max-w-md" onClick={e => e.stopPropagation()}>
        <div className="modal-body text-center py-8">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--danger)' + '20' }}>
            <TrashIcon className="icon-xl" style={{ color: 'var(--danger)' }} />
          </div>
          <h3 id="delete-modal-title" className="text-lg font-semibold mb-2">Delete Expense</h3>
          <p className="text-muted mb-6">Are you sure you want to delete <strong className="text-white">"{itemName}"</strong>? This action cannot be undone.</p>
          <div className="flex gap-3 justify-center">
            <button className="btn-secondary" onClick={onCancel}>Cancel</button>
            <button className="btn-danger bg-danger text-white hover:bg-danger/90" onClick={onConfirm}>Delete</button>
          </div>
        </div>
      </div>
    </div>
  );
}