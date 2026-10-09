import React from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { useModalScrollLock } from '../utils/useModalScrollLock';
import './DeleteConfirmationModal.css';

export default function DeleteConfirmationModal({
  isOpen,
  appsToDelete = [],
  onConfirm,
  onClose
}) {
  useModalScrollLock(isOpen);

  if (!isOpen) return null;

  const count = appsToDelete.length;
  const isMultiple = count > 1;

  return (
    <div className="delete-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="delete-dialog-title">
      <div className="delete-modal-card" onClick={(e) => e.stopPropagation()}>
        <button 
          className="delete-modal-close-btn" 
          onClick={onClose}
          aria-label="Close dialog"
        >
          <X size={16} />
        </button>

        <div className="delete-modal-icon-wrapper">
          <Trash2 size={24} className="delete-modal-icon" />
        </div>

        <h3 id="delete-dialog-title" className="delete-modal-title">
          {isMultiple ? `Delete ${count} Applications?` : 'Delete Application?'}
        </h3>

        <p className="delete-modal-description">
          {isMultiple ? (
            <>Are you sure you want to remove these <strong>{count} applications</strong> from your directory? This action cannot be undone.</>
          ) : (
            <>Are you sure you want to remove <strong>{appsToDelete[0]?.name || 'this application'}</strong> from your directory?</>
          )}
        </p>

        {appsToDelete.length > 0 && (
          <div className="delete-apps-preview-list">
            {appsToDelete.slice(0, 4).map((app) => (
              <span key={app.id} className="delete-app-tag">
                {app.name}
              </span>
            ))}
            {appsToDelete.length > 4 && (
              <span className="delete-app-tag-more">
                +{appsToDelete.length - 4} more
              </span>
            )}
          </div>
        )}

        <div className="delete-modal-actions">
          <button
            type="button"
            className="apple-button apple-button-secondary delete-btn-cancel"
            onClick={onClose}
            id="btn-cancel-delete"
          >
            Cancel
          </button>
          <button
            type="button"
            className="apple-button delete-btn-confirm"
            onClick={onConfirm}
            id="btn-confirm-delete"
            autoFocus
          >
            <Trash2 size={15} />
            <span>{isMultiple ? `Delete ${count} Apps` : 'Delete App'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
