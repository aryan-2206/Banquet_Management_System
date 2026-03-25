import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useGREStore from './useGREStore';
import './GRE.css';

const Icon = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const ACTION_COLORS = {
  check_in: 'var(--gre-success)',
  undo_check_in: 'var(--gre-warning)',
  duplicate_scan: 'var(--gre-error)',
  add_walk_in: 'var(--gre-info)',
  kitchen_push: 'var(--gre-gold)',
  freeze_headcount: 'var(--gre-error)',
  flag_issue: 'var(--gre-warning)',
  send_po: '#25D366',
  resend_fp: '#25D366',
};

const ACTION_LABELS = {
  check_in: 'Guest Checked In',
  undo_check_in: 'Check-in Undone',
  duplicate_scan: 'Duplicate Scan',
  add_walk_in: 'Walk-in Added',
  kitchen_push: 'Kitchen Updated',
  freeze_headcount: 'Count Frozen',
  flag_issue: 'Issue Flagged',
  send_po: 'PO Sent',
  resend_fp: 'FP Resent',
};

const FILTER_OPTIONS = ['all', 'check_in', 'duplicate_scan', 'kitchen_push', 'add_walk_in', 'flag_issue'];

export default function GREAuditLog() {
  const navigate = useNavigate();
  const auditLog = useGREStore(s => s.auditLog);
  const [filter, setFilter] = useState('all');

  const filtered = filter === 'all' ? auditLog : auditLog.filter(e => e.action === filter);

  return (
    <div className="gre-root">
      <div className="gre-topbar" style={{ justifyContent: 'flex-start', gap: 12 }}>
        <button style={{ background: 'none', border: 'none', color: 'var(--gre-gold)', cursor: 'pointer' }}
          onClick={() => navigate('/gre')}>
          <Icon d="M19 12H5M12 19l-7-7 7-7" size={20} />
        </button>
        <span style={{ fontWeight: 600, fontSize: 16 }}>Audit Log</span>
        <span style={{ marginLeft: 'auto', fontSize: 14, color: 'var(--gre-text-dim)' }}>
          {filtered.length} entries
        </span>
      </div>

      <div style={{ padding: '64px 0 80px', minHeight: '100vh' }}>
        {/* Filters */}
        <div className="gre-filter-bar" style={{ top: 56 }}>
          <div className="gre-filter-pills">
            {FILTER_OPTIONS.map(f => (
              <button key={f}
                className={`gre-filter-pill ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}>
                {f === 'all' ? 'All' : ACTION_LABELS[f] || f}
              </button>
            ))}
          </div>
        </div>

        {/* Entries */}
        <div style={{ padding: '0 16px' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--gre-text-dim)', fontSize: 15 }}>
              No audit entries yet
            </div>
          ) : (
            filtered.map((entry, i) => (
              <div key={entry.id} className="gre-audit-entry" style={{ animationDelay: `${i * 0.03}s` }}>
                <div className="gre-audit-dot" style={{ background: ACTION_COLORS[entry.action] || 'var(--gre-gold)' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, color: 'var(--gre-text)', marginBottom: 4 }}>
                    <strong>{ACTION_LABELS[entry.action] || entry.action}</strong>
                    {entry.payload?.guestName && (
                      <span style={{ color: 'var(--gre-text-muted)' }}> — {entry.payload.guestName}</span>
                    )}
                    {entry.payload?.count !== undefined && (
                      <span style={{ color: 'var(--gre-text-muted)' }}> — {entry.payload.count} guests</span>
                    )}
                    {entry.payload?.note && (
                      <span style={{ color: 'var(--gre-warning)' }}> — "{entry.payload.note}"</span>
                    )}
                  </div>
                  <div className="gre-audit-time" style={{ fontSize: 13 }}>
                    {new Date(entry.timestamp).toLocaleTimeString()} · by {entry.actorName}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
