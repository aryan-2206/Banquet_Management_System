import React, { useEffect, useRef } from 'react';
import useFinanceStore from './useFinanceStore';

const ACTION_LABELS = {
  RECORD_PAYMENT:        { label: 'Payment Recorded',      icon: '₹', color: '#5FBF8A' },
  CONFIRM_BOOKING:       { label: 'Booking Confirmed',     icon: '✓', color: '#5FBF8A' },
  ADD_INSTALLMENT:       { label: 'Installment Added',     icon: '⊕', color: '#5B8FE8' },
  UPDATE_INSTALLMENT_PLAN:{ label: 'Plan Updated',         icon: '✎', color: '#C9A84C' },
  SEND_REMINDER:         { label: 'Reminder Sent',         icon: '✉', color: '#9B6DE8' },
};

function fmt(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' · ' + d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

export default function FinanceAuditLog({ open, onClose }) {
  const auditLog = useFinanceStore((s) => s.auditLog);
  const drawerRef = useRef();

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fal-backdrop ${open ? 'fal-backdrop--open' : ''}`}
        onClick={onClose}
        aria-hidden
      />

      {/* Drawer */}
      <aside
        ref={drawerRef}
        className={`fal-drawer glass ${open ? 'fal-drawer--open' : ''}`}
        role="complementary"
        aria-label="Activity Log"
      >
        <div className="fal-header">
          <div>
            <p className="fal-super">Finance Manager</p>
            <h2 className="fal-title">Activity Log</h2>
          </div>
          <button className="fal-close" onClick={onClose} aria-label="Close activity log">✕</button>
        </div>

        {auditLog.length === 0 ? (
          <div className="fal-empty">
            <div className="fal-empty__icon">◎</div>
            <p className="fal-empty__text">No activity yet</p>
            <p className="fal-empty__sub">Actions like recording payments or confirming bookings will appear here.</p>
          </div>
        ) : (
          <ul className="fal-list">
            {auditLog.map((entry, i) => {
              const cfg = ACTION_LABELS[entry.action] || { label: entry.action, icon: '◈', color: '#C9A84C' };
              return (
                <li key={entry.id} className="fal-item animate-fade-up" style={{ animationDelay: `${i * 0.04}s` }}>
                  <div className="fal-item__icon" style={{ color: cfg.color, background: `${cfg.color}18`, borderColor: `${cfg.color}30` }}>
                    {cfg.icon}
                  </div>
                  <div className="fal-item__body">
                    <div className="fal-item__action">{cfg.label}</div>
                    {entry.bookingId && (
                      <div className="fal-item__booking">Booking: {entry.bookingId}</div>
                    )}
                    <div className="fal-item__meta">
                      {entry.actor} · {fmt(entry.timestamp)}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </aside>
    </>
  );
}
