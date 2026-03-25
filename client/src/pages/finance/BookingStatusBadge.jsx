import React from 'react';

/**
 * Finance-specific booking status badge.
 * Extends the shared StatusBadge with finance-specific states and animations.
 */
const CONFIGS = {
  temporary: {
    label: 'Temp Enquiry',
    cls: 'badge-finance--temporary',
    dot: true,
    icon: '◌',
  },
  deposit: {
    label: 'Deposit Received',
    cls: 'badge-finance--deposit',
    dot: true,
    icon: '◑',
  },
  confirmed: {
    label: 'Confirmed',
    cls: 'badge-finance--confirmed',
    dot: true,
    icon: '✓',
  },
  overdue: {
    label: 'Payment Overdue',
    cls: 'badge-finance--overdue',
    dot: true,
    icon: '!',
    blink: true,
  },
  settled: {
    label: 'Fully Settled',
    cls: 'badge-finance--settled',
    dot: false,
    icon: '✓',
  },
  cancelled: {
    label: 'Cancelled',
    cls: 'badge-finance--cancelled',
    dot: true,
    icon: '✕',
  },
};

export default function BookingStatusBadge({ status, showIcon = true, size = 'sm' }) {
  const key   = (status || '').toLowerCase();
  const cfg   = CONFIGS[key] || { label: status || 'Unknown', cls: 'badge-finance--temporary', icon: '?', dot: false };
  const sSize = size === 'lg' ? { fontSize: '.78rem', padding: '5px 14px' } : {};

  return (
    <span
      className={`badge-finance ${cfg.cls} ${cfg.blink ? 'badge-finance--blink' : ''}`}
      style={sSize}
    >
      {cfg.dot && <span className="badge-finance__dot" />}
      {showIcon && <span className="badge-finance__icon">{cfg.icon}</span>}
      {cfg.label}
    </span>
  );
}
