import React from 'react';
import { SearchX, RotateCcw } from 'lucide-react';
import './EmptyState.css';

export default function EmptyState({ onClearFilters, searchQuery, selectedCategory }) {
  return (
    <div className="empty-state-wrapper" id="empty-state">
      <div className="empty-state-icon-box">
        <SearchX size={32} className="empty-icon" />
      </div>
      
      <h3 className="empty-state-title">No apps found</h3>
      
      <p className="empty-state-text">
        {searchQuery && selectedCategory !== 'All' ? (
          <>
            No results for &ldquo;<strong>{searchQuery}</strong>&rdquo; in category &ldquo;<strong>{selectedCategory}</strong>&rdquo;.
          </>
        ) : searchQuery ? (
          <>
            No results found for &ldquo;<strong>{searchQuery}</strong>&rdquo;.
          </>
        ) : (
          <>
            No apps found in category &ldquo;<strong>{selectedCategory}</strong>&rdquo;.
          </>
        )}
      </p>

      <p className="empty-state-subtext">
        Try adjusting your search or filters.
      </p>

      <button 
        type="button" 
        className="apple-button apple-button-secondary-pill empty-clear-btn"
        onClick={onClearFilters}
        id="btn-clear-filters"
      >
        <RotateCcw size={14} />
        <span>Clear Filters</span>
      </button>
    </div>
  );
}
