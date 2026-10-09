import React from 'react';
import { ArrowUpDown, ChevronDown } from 'lucide-react';
import { SORT_OPTIONS } from '../data/appsData';
import './SortDropdown.css';

export default function SortDropdown({ sortOption, onSortChange }) {
  return (
    <div className="sort-dropdown-container">
      <label htmlFor="sort-select" className="sort-label">
        <ArrowUpDown size={14} className="sort-icon" />
        <span>Sort:</span>
      </label>
      <div className="sort-select-wrapper">
        <select
          id="sort-select"
          value={sortOption}
          onChange={(e) => onSortChange(e.target.value)}
          className="sort-select"
          aria-label="Sort apps by"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown size={14} className="select-chevron" />
      </div>
    </div>
  );
}
