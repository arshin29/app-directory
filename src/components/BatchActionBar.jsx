import React from 'react';
import { CheckSquare, Square, Trash2, X, RotateCcw } from 'lucide-react';
import './BatchActionBar.css';

export default function BatchActionBar({
  isSelectMode,
  selectedCount,
  totalFilteredCount,
  onToggleSelectAll,
  onDeleteSelected,
  onCancel,
  onResetDefaults
}) {
  if (!isSelectMode) return null;

  const allSelected = totalFilteredCount > 0 && selectedCount === totalFilteredCount;

  return (
    <div className="batch-action-bar-dock" role="toolbar" aria-label="Batch app management actions">
      <div className="batch-bar-container">
        {/* Select All Toggle */}
        <button
          type="button"
          className="batch-btn batch-btn--subtle"
          onClick={onToggleSelectAll}
          title={allSelected ? 'Deselect all visible apps' : 'Select all visible apps'}
        >
          {allSelected ? <CheckSquare size={16} /> : <Square size={16} />}
          <span>{allSelected ? 'Deselect All' : 'Select All'}</span>
        </button>

        <div className="batch-divider" />

        {/* Selected Count */}
        <div className="batch-count-display">
          <strong>{selectedCount}</strong>
          <span>{selectedCount === 1 ? 'app selected' : 'apps selected'}</span>
        </div>

        <div className="batch-divider" />

        {/* Delete Selected Action */}
        <button
          type="button"
          className="batch-btn batch-btn--danger"
          onClick={onDeleteSelected}
          disabled={selectedCount === 0}
          title={selectedCount === 0 ? 'Select apps to delete' : `Delete ${selectedCount} selected apps`}
          id="btn-delete-selected"
        >
          <Trash2 size={15} />
          <span>Delete</span>
        </button>

        {/* Cancel / Done button */}
        <button
          type="button"
          className="batch-btn batch-btn--done"
          onClick={onCancel}
          title="Exit selection mode"
          id="btn-cancel-select"
        >
          <span>Done</span>
        </button>
      </div>
    </div>
  );
}
