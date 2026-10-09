import React, { useRef } from 'react';
import { Search, X } from 'lucide-react';
import './SearchBar.css';

export default function SearchBar({ searchQuery, onSearchChange }) {
  const inputRef = useRef(null);

  const handleClear = () => {
    onSearchChange('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className="search-bar-wrapper">
      <div className="search-bar-container">
        <Search size={17} className="search-icon" />
        
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search 3D apps..."
          className="search-input"
          aria-label="Search 3D apps"
          id="search-3d-apps-input"
        />

        {searchQuery && (
          <button 
            type="button" 
            className="search-clear-btn" 
            onClick={handleClear}
            aria-label="Clear search input"
          >
            <X size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
