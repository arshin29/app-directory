import React from 'react';
import './StatusBadge.css';

export default function StatusBadge({ status, size = 'normal' }) {
  let badgeClass = 'status-badge-coming';
  let dotClass = 'status-dot-coming';
  let label = status || 'Coming Soon';

  if (status === 'Ready') {
    badgeClass = 'status-badge-ready';
    dotClass = 'status-dot-ready';
  } else if (status === 'In Progress') {
    badgeClass = 'status-badge-progress';
    dotClass = 'status-dot-progress';
  }

  return (
    <span className={`status-badge ${badgeClass} status-badge--${size}`}>
      <span className={`status-dot ${dotClass}`} />
      <span className="status-label">{label}</span>
    </span>
  );
}
