import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useGREStore from './useGREStore';
import './GRE.css';

const Icon = ({ d, size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'checkedIn', label: 'Checked In' },
  { id: 'notArrived', label: 'Not Arrived' },
  { id: 'vip', label: 'VIP' },
  { id: 'dietary', label: 'Dietary Flag' },
  { id: 'walkIn', label: 'Walk-ins' },
];

/* ── Guest Detail Sheet ── */
function GuestDetailSheet({ guest, onClose }) {
  const checkedIn = useGREStore(s => s.checkedIn);
  const checkInGuest = useGREStore(s => s.checkInGuest);
  const undoCheckIn = useGREStore(s => s.undoCheckIn);
  const session = useGREStore(s => s.session);
  const addAuditEntry = useGREStore(s => s.addAuditEntry);

  const [undoCountdown, setUndoCountdown] = useState(null);
  const [flagOpen, setFlagOpen] = useState(false);
  const [flagNote, setFlagNote] = useState('');

  const isCheckedIn = checkedIn.has(guest.id);
  const canUndo = isCheckedIn && guest.checkedInAt &&
    (Date.now() - new Date(guest.checkedInAt).getTime()) < 60000;

  // Start undo countdown
  const handleUndo = () => {
    undoCheckIn(guest.id, session?.staffId, session?.staffName);
    onClose();
  };

  return (
    <>
      <div className="gre-sheet-overlay" onClick={onClose} />
      <div className="gre-sheet">
        <div className="gre-sheet-handle" />

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: isCheckedIn ? 'var(--gre-success-soft)' : 'rgba(255,255,255,.05)',
            border: `2px solid ${isCheckedIn ? 'var(--gre-success)' : 'var(--gre-text-dim)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 20, fontWeight: 700, color: isCheckedIn ? 'var(--gre-success)' : 'var(--gre-text-dim)',
          }}>
            {guest.name.split(' ').map(w => w[0]).join('').slice(0, 2)}
          </div>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 24, marginBottom: 4 }}>{guest.name}</h3>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span className={`gre-pill ${guest.isWalkIn ? 'amber' : 'gold'}`} style={{ fontSize: 12 }}>
                {guest.isWalkIn ? 'WALK-IN' : 'RSVP'}
              </span>
              {guest.isVIP && <span className="gre-pill gold" style={{ fontSize: 12 }}>👑 VIP</span>}
            </div>
          </div>
        </div>

        {/* Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          {[
            { label: 'Booking Ref', value: guest.bookingRef },
            { label: 'Table / Seat', value: `${guest.table} · ${guest.seat}` },
            { label: 'Phone', value: guest.phone || '—' },
            { label: 'Check-in', value: guest.checkedInAt ? new Date(guest.checkedInAt).toLocaleTimeString() : '—' },
          ].map(d => (
            <div key={d.label}>
              <div style={{ fontSize: 13, color: 'var(--gre-text-dim)', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 }}>
                {d.label}
              </div>
              <div style={{ fontSize: 16, color: 'var(--gre-text)' }}>{d.value}</div>
            </div>
          ))}
        </div>

        {guest.checkedInByName && (
          <div style={{ fontSize: 12, color: 'var(--gre-text-dim)', marginBottom: 8 }}>
            Checked in by: <span style={{ color: 'var(--gre-text-muted)' }}>{guest.checkedInByName}</span>
          </div>
        )}

        {/* Dietary notes */}
        {guest.dietaryFlag && (
          <div style={{
            background: 'var(--gre-warning-soft)', border: '1px solid rgba(245,158,11,.25)',
            borderRadius: 12, padding: '14px 18px', marginBottom: 16,
            fontSize: 15, fontWeight: 600, color: 'var(--gre-warning)',
          }}>
            ⚠ DIETARY: {guest.dietaryFlag}
          </div>
        )}

        {/* Phone actions */}
        {guest.phone && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <a href={`tel:${guest.phone}`} className="gre-pill gold" style={{ textDecoration: 'none', cursor: 'pointer' }}>
              📞 Call
            </a>
            <a href={`https://wa.me/${guest.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
              className="gre-pill green" style={{ textDecoration: 'none', cursor: 'pointer' }}>
              💬 WhatsApp
            </a>
          </div>
        )}

        {/* Actions */}
        <div className="gre-sheet-actions">
          {!isCheckedIn && (
            <button className="gre-sheet-btn primary" onClick={() => {
              checkInGuest(guest.id, session?.staffId, session?.staffName);
              if (navigator.vibrate) navigator.vibrate(200);
              onClose();
            }}>
              ✓ Check in Manually
            </button>
          )}
          {canUndo && (
            <button className="gre-sheet-btn danger" onClick={handleUndo}>
              ↩ Undo Check-in ({Math.ceil((60000 - (Date.now() - new Date(guest.checkedInAt).getTime())) / 1000)}s)
            </button>
          )}
          {guest.isVIP && !isCheckedIn && (
            <button className="gre-sheet-btn ghost" style={{ color: 'var(--gre-vip)' }}>
              👑 Mark VIP Arrived
            </button>
          )}
          <button className="gre-sheet-btn ghost" onClick={() => setFlagOpen(!flagOpen)}>
            🚩 Flag Issue
          </button>
          {flagOpen && (
            <div style={{ display: 'flex', gap: 8, animation: 'gre-slide-up .2s ease' }}>
              <input value={flagNote} onChange={e => setFlagNote(e.target.value)}
                placeholder="Describe the issue..." className="gre-form-input" style={{ flex: 1 }} />
              <button className="gre-pill red" style={{ cursor: 'pointer', border: '1px solid rgba(239,68,68,.3)' }}
                onClick={() => {
                  addAuditEntry('flag_issue', session?.staffId, session?.staffName,
                    { guestId: guest.id, guestName: guest.name, note: flagNote });
                  setFlagOpen(false); setFlagNote('');
                }}>
                Submit
              </button>
            </div>
          )}
          <button className="gre-sheet-btn ghost" onClick={onClose}>Close</button>
        </div>
      </div>
    </>
  );
}

/* ── MAIN GUEST LIST ── */
export default function GuestList() {
  const navigate = useNavigate();
  const guests = useGREStore(s => s.guests);
  const checkedIn = useGREStore(s => s.checkedIn);
  const currentEvent = useGREStore(s => s.currentEvent);

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [selectedGuest, setSelectedGuest] = useState(null);

  const debounceRef = React.useRef(null);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // 150ms debounce
  React.useEffect(() => {
    debounceRef.current = setTimeout(() => setDebouncedSearch(search), 150);
    return () => clearTimeout(debounceRef.current);
  }, [search]);

  const filteredGuests = useMemo(() => {
    let list = Array.from(guests.values());

    // Filter
    if (filter === 'checkedIn') list = list.filter(g => checkedIn.has(g.id));
    else if (filter === 'notArrived') list = list.filter(g => !checkedIn.has(g.id));
    else if (filter === 'vip') list = list.filter(g => g.isVIP);
    else if (filter === 'dietary') list = list.filter(g => g.dietaryFlag);
    else if (filter === 'walkIn') list = list.filter(g => g.isWalkIn);

    // Search
    if (debouncedSearch) {
      const q = debouncedSearch.toLowerCase();
      list = list.filter(g => g.name.toLowerCase().includes(q) || g.phone?.includes(q) ||
        g.bookingRef.toLowerCase().includes(q));
    }

    // Sort
    if (sortBy === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'seat') list.sort((a, b) => (a.table || '').localeCompare(b.table || ''));
    else if (sortBy === 'time') list.sort((a, b) => {
      if (!a.checkedInAt && !b.checkedInAt) return 0;
      if (!a.checkedInAt) return 1;
      if (!b.checkedInAt) return -1;
      return new Date(b.checkedInAt) - new Date(a.checkedInAt);
    });

    return list;
  }, [guests, checkedIn, filter, debouncedSearch, sortBy]);

  const arrived = checkedIn.size;
  const total = guests.size;
  const pct = total > 0 ? Math.round((arrived / total) * 100) : 0;

  return (
    <div className="gre-root">
      {/* Back header */}
      <div className="gre-topbar" style={{ justifyContent: 'flex-start', gap: 12 }}>
        <button style={{ background: 'none', border: 'none', color: 'var(--gre-gold)', cursor: 'pointer' }}
          onClick={() => navigate('/gre')}>
          <Icon d="M19 12H5M12 19l-7-7 7-7" size={20} />
        </button>
        <span style={{ fontWeight: 600, fontSize: 15 }}>Guest List</span>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--gre-text-dim)' }}>{arrived}/{total}</span>
      </div>

      <div className="gre-list-page">
        {/* Filter bar */}
        <div className="gre-filter-bar">
          <div style={{ position: 'relative' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gre-text-dim)"
              strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search name or phone..." className="gre-search" />
          </div>
          <div className="gre-filter-pills">
            {FILTERS.map(f => (
              <button key={f.id}
                className={`gre-filter-pill ${filter === f.id ? 'active' : ''}`}
                onClick={() => setFilter(f.id)}>
                {f.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 6, paddingBottom: 4 }}>
            {[{ id: 'name', label: 'Name A-Z' }, { id: 'seat', label: 'Seat' }, { id: 'time', label: 'Check-in' }].map(s => (
              <button key={s.id}
                className={`gre-filter-pill ${sortBy === s.id ? 'active' : ''}`}
                style={{ fontSize: 11 }}
                onClick={() => setSortBy(s.id)}>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Guest rows */}
        <div>
          {filteredGuests.map(g => {
            const isIn = checkedIn.has(g.id);
            return (
              <div key={g.id} className="gre-guest-row" onClick={() => setSelectedGuest(g)}>
                <div className={`gre-guest-status ${isIn ? 'checked' : ''} ${g.isVIP && !isIn ? 'vip-pending' : ''}`} />
                <div className="gre-guest-info">
                  <div className="gre-guest-name">
                    {g.name} {g.isVIP && <span className="gre-vip-icon">👑</span>}
                  </div>
                  <div className="gre-guest-ref">{g.bookingRef}</div>
                </div>
                <div className="gre-guest-badges">
                  <span className="gre-table-chip">{g.table}</span>
                  {g.dietaryFlag && (
                    <span className={`gre-diet-badge ${g.dietaryFlag.toLowerCase().includes('allergy') ? 'allergy' : 'pref'}`}>
                      {g.dietaryFlag.toLowerCase().includes('allergy') ? '⚠' : '🥗'}
                    </span>
                  )}
                </div>
                <span className="gre-checkin-time">
                  {isIn && g.checkedInAt ? new Date(g.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}
                </span>
              </div>
            );
          })}
          {filteredGuests.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--gre-text-dim)' }}>
              No guests match this filter
            </div>
          )}
        </div>
      </div>

      {/* Summary footer */}
      <div className="gre-summary-footer">
        <span style={{ fontSize: 13, color: 'var(--gre-text-muted)' }}>
          {arrived} of {total} checked in — {total - arrived} remaining
        </span>
        <span className={`gre-pill ${pct >= 90 ? 'green' : pct >= 50 ? 'gold' : 'amber'}`}>
          {pct}%
        </span>
      </div>

      {/* Guest detail sheet */}
      {selectedGuest && (
        <GuestDetailSheet guest={selectedGuest} onClose={() => setSelectedGuest(null)} />
      )}

      {/* Bottom nav */}
      <div className="gre-bottom-nav">
        <button className="gre-nav-tab" onClick={() => navigate('/gre')}>
          <Icon d="M22 12h-4l-3 9L9 3l-3 9H2" size={20} />Overview
        </button>
        <button className="gre-nav-tab" onClick={() => navigate('/gre/scanner')}>
          <Icon d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" size={20} />Scanner
        </button>
        <button className="gre-nav-tab active">
          <Icon d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" size={20} />Guest List
        </button>
        <button className="gre-nav-tab" onClick={() => navigate('/gre/live')}>
          <Icon d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v6l4 2" size={20} />Activity
        </button>
      </div>
    </div>
  );
}
