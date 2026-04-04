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

export default function WalkInForm() {
  const navigate = useNavigate();
  const addWalkIn = useGREStore(s => s.addWalkIn);
  const session = useGREStore(s => s.session);
  const walkIns = useGREStore(s => s.walkIns);
  const walkInLimit = useGREStore(s => s.walkInLimit);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [table, setTable] = useState('');
  const [dietary, setDietary] = useState('');
  const [guestCount, setGuestCount] = useState('1');
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    const result = addWalkIn(
      { name: name.trim(), phone, table, dietaryFlag: dietary || null, guestCount: parseInt(guestCount) || 1 },
      session?.staffId, session?.staffName
    );
    if (result.ok) {
      if (navigator.vibrate) navigator.vibrate(200);
      setSuccess(result.guest);
      setName(''); setPhone(''); setTable(''); setDietary(''); setGuestCount('1');
      setTimeout(() => setSuccess(null), 3000);
    } else {
      setError(result.reason);
      setTimeout(() => setError(null), 3000);
    }
  };

  return (
    <div className="gre-root">
      <div className="gre-topbar" style={{ justifyContent: 'flex-start', gap: 12 }}>
        <button style={{ background: 'none', border: 'none', color: 'var(--gre-gold)', cursor: 'pointer' }}
          onClick={() => navigate('/gre')}>
          <Icon d="M19 12H5M12 19l-7-7 7-7" size={20} />
        </button>
        <span style={{ fontWeight: 600, fontSize: 16 }}>Add Walk-in Guest</span>
        <span style={{ marginLeft: 'auto', fontSize: 14, color: 'var(--gre-text-dim)' }}>
          {walkIns.length}/{walkInLimit}
        </span>
      </div>

      <div style={{ padding: '72px 16px 100px', animation: 'gre-slide-up .4s ease both' }}>
        {/* Success toast */}
        {success && (
          <div className="gre-toast" style={{ background: 'var(--gre-success)', color: 'white' }}>
            ✓ {success.name} added as walk-in
          </div>
        )}
        {error && (
          <div className="gre-toast" style={{ background: 'var(--gre-error)', color: 'white' }}>
            ✕ {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="gre-form-group">
            <label className="gre-form-label">Guest Name *</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)}
              placeholder="Full name" className="gre-form-input" required autoFocus />
          </div>
          <div className="gre-form-group">
            <label className="gre-form-label">Phone Number</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="+91 98xxx xxxxx" className="gre-form-input" inputMode="tel" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="gre-form-group">
              <label className="gre-form-label">Table Assignment</label>
              <input type="text" value={table} onChange={e => setTable(e.target.value)}
                placeholder="e.g. T5" className="gre-form-input" />
            </div>
            <div className="gre-form-group">
              <label className="gre-form-label">Party Size</label>
              <input type="number" value={guestCount} onChange={e => setGuestCount(e.target.value)}
                min="1" className="gre-form-input" inputMode="numeric" />
            </div>
          </div>
          <div className="gre-form-group">
            <label className="gre-form-label">Dietary Restriction</label>
            <input type="text" value={dietary} onChange={e => setDietary(e.target.value)}
              placeholder="e.g. Nut allergy, Vegetarian" className="gre-form-input" />
          </div>

          <button type="submit" className="gre-btn primary"
            style={{ width: '100%', marginTop: 12, minHeight: 60, animation: 'none' }}
            disabled={!name.trim() || walkIns.length >= walkInLimit}>
            <Icon d="M12 5v14M5 12h14" size={20} />
            Add Walk-in Guest
          </button>
        </form>

        {/* Recent walk-ins */}
        {walkIns.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div className="gre-card-title">Recent Walk-ins ({walkIns.length})</div>
            {walkIns.slice(-5).reverse().map(w => (
              <div key={w.id} className="gre-guest-row" style={{ cursor: 'default' }}>
                <div className="gre-guest-status checked" />
                <div className="gre-guest-info">
                  <div className="gre-guest-name">{w.name}</div>
                  <div className="gre-guest-ref">{w.bookingRef} · {w.table || 'Unassigned'}</div>
                </div>
                <span className="gre-pill amber" style={{ fontSize: 10 }}>WALK-IN</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
