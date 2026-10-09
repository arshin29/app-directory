import React from 'react';

export function VercelIcon({ size = 14, className = '' }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="currentColor" 
      className={className}
      aria-hidden="true"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      <path d="M12 2L24 22H0L12 2Z" />
    </svg>
  );
}
