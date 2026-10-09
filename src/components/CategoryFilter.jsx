import React from 'react';
import './CategoryFilter.css';

export default function CategoryFilter({ 
  categories, 
  selectedCategory, 
  onSelectCategory,
  categoryCounts 
}) {
  return (
    <div className="category-filter-wrapper" role="tablist" aria-label="Category filters">
      <div className="category-filter-scroll">
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat;
          const count = categoryCounts ? categoryCounts[cat] : null;

          return (
            <button
              key={cat}
              role="tab"
              aria-selected={isSelected}
              className={`category-pill-btn ${isSelected ? 'category-pill-btn--active' : ''}`}
              onClick={() => onSelectCategory(cat)}
              id={`cat-filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <span className="category-label">{cat}</span>
              {count !== undefined && count !== null && (
                <span className="category-count-badge">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
