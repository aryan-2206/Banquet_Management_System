import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useGREStore from './useGREStore';
import useSound from './useSound';
import './GRE.css';

/* ── Inline SVG icons ── */
const Icon = ({ d, size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
    className={className}><path d={d} /></svg>
);
const ICONS = {
  qr: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM17 17h3v3h-3z',
  users: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  plus: 'M12 5v14M5 12h14',
  send: 'M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  activity: 'M22 12h-4l-3 9L9 3l-3 9H2',
  wifi: 'M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0M12 20h.01',
  volume: 'M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07',
  volumeOff: 'M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6',
  contrast: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 2v20',
  logout: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  clock: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM12 6v6l4 2',
  camera: 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  alert: 'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
  zap: 'M13 2 3 14h9l-1 8 10-12h-9l1-8z',
  textPlus: 'M12 5v14M5 12h14',
  textMinus: 'M5 12h14',
};

/* ── Staff Avatar Sheet ── */
function StaffSheet({ open, onClose, session }) {
  const clearSession = useGREStore(s => s.clearSession);
  const navigate = useNavigate();
  if (!open) return null;
  return (
    <>
      <div className="gre-sheet-overlay" onClick={onClose} />
      <div className="gre-sheet" style={{ maxHeight: '40vh' }}>
        <div className="gre-sheet-handle" />
        <h3>{session?.staffName || 'Staff'}</h3>
        <p style={{ fontSize: 13, color: 'var(--gre-text-muted)', marginBottom: 8 }}>
          Role: {session?.role?.toUpperCase()} · Event PIN: {session?.eventPin}
        </p>
        <p style={{ fontSize: 12, color: 'var(--gre-text-dim)' }}>
          Session started: {session?.loginAt ? new Date(session.loginAt).toLocaleTimeString() : '—'}
        </p>
        <div className="gre-sheet-actions">
          <button className="gre-sheet-btn danger" onClick={() => { clearSession(); navigate('/'); onClose(); }}>
            <Icon d={ICONS.logout} size={16} /> End Shift & Logout
          </button>
          <button className="gre-sheet-btn ghost" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </>
  );
}

/* ── Top Bar Component ── */
function TopBar({ session, isOnline, soundEnabled, highContrast, textSizeOffset }) {
  const [now, setNow] = useState(new Date());
  const [staffSheet, setStaffSheet] = useState(false);
  const toggleSound = useGREStore(s => s.toggleSound);
  const toggleHC = useGREStore(s => s.toggleHighContrast);
  const adjustText = useGREStore(s => s.adjustTextSize);
  const currentEvent = useGREStore(s => s.currentEvent);

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <div className="gre-topbar">
        <div className="gre-topbar-logo">B</div>
        <span className="gre-topbar-event">{currentEvent.name} — {currentEvent.hall}</span>
        <span className="gre-topbar-clock">
          {now.toLocaleTimeString('en-IN', { hour12: false })}
        </span>
        <div className="gre-topbar-right">
          <div className="gre-a11y-controls">
            <button className={`gre-a11y-btn ${soundEnabled ? 'active' : ''}`}
              onClick={toggleSound} aria-label="Toggle sound">
              <Icon d={soundEnabled ? ICONS.volume : ICONS.volumeOff} size={14} />
            </button>
            <button className={`gre-a11y-btn ${highContrast ? 'active' : ''}`}
              onClick={toggleHC} aria-label="Toggle high contrast">
              <Icon d={ICONS.contrast} size={14} />
            </button>
            <button className="gre-a11y-btn" onClick={() => adjustText(-1)} aria-label="Decrease text">
              A<span style={{ fontSize: 8 }}>−</span>
            </button>
            <button className="gre-a11y-btn" onClick={() => adjustText(1)} aria-label="Increase text">
              A<span style={{ fontSize: 8 }}>+</span>
            </button>
          </div>
          <div className={`gre-status-dot ${isOnline ? 'online' : 'offline'}`}
            title={isOnline ? 'Online' : 'Offline'} />
          <div className="gre-avatar-chip" onClick={() => setStaffSheet(true)}>
            {session?.initials || '??'}
          </div>
        </div>
      </div>
      <StaffSheet open={staffSheet} onClose={() => setStaffSheet(false)} session={session} />
    </>
  );
}

/* ── Headcount Ring ── */
function HeadcountRing({ arrived, expected }) {
  const pct = expected > 0 ? arrived / expected : 0;
  const R = 90, C = 2 * Math.PI * R;
  const offset = C - pct * C;
  const [punch, setPunch] = useState(false);
  const prevArrived = useRef(arrived);

  useEffect(() => {
    if (arrived > prevArrived.current) {
      setPunch(true);
      const t = setTimeout(() => setPunch(false), 180);
      prevArrived.current = arrived;
      return () => clearTimeout(t);
    }
    prevArrived.current = arrived;
  }, [arrived]);

  const strokeColor = pct >= 0.9 ? '#16a34a' : pct >= 0.5 ? '#C9A84C' : '#f59e0b';
  const remaining = Math.max(0, expected - arrived);

  return (
    <div className="gre-hero">
      <div className="gre-ring-wrap">
        <svg className="gre-ring-svg" viewBox="0 0 200 200">
          <circle className="gre-ring-bg" cx="100" cy="100" r={R} />
          <circle
            className={`gre-ring-fg ${pct >= 0.9 ? 'glow-green' : ''}`}
            cx="100" cy="100" r={R}
            stroke={strokeColor}
            strokeDasharray={C}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="gre-ring-inner">
          <div className={`gre-count-big ${punch ? 'punch' : ''}`}>{arrived}</div>
          <div className="gre-count-sub">/ {expected}</div>
        </div>
      </div>
      <div className="gre-ring-label">
        {expected} expected · {arrived} arrived · {remaining} remaining
      </div>
    </div>
  );
}

/* ── Main Dashboard ── */
export default function GREDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [alertSheet, setAlertSheet] = useState(null);

  const session = useGREStore(s => s.session);
  const isOnline = useGREStore(s => s.isOnline);
  const setOnline = useGREStore(s => s.setOnline);
  const currentEvent = useGREStore(s => s.currentEvent);
  const checkedIn = useGREStore(s => s.checkedIn);
  const guests = useGREStore(s => s.guests);
  const lastPushedCount = useGREStore(s => s.lastPushedCount);
  const getAlerts = useGREStore(s => s.getAlerts);
  const getArrivalVelocity = useGREStore(s => s.getArrivalVelocity);
  const soundEnabled = useGREStore(s => s.soundEnabled);
  const highContrast = useGREStore(s => s.highContrast);
  const textSizeOffset = useGREStore(s => s.textSizeOffset);
  const headcountFrozen = useGREStore(s => s.headcountFrozen);

  // Session expiry warning
  const [expiryWarning, setExpiryWarning] = useState(false);
  useEffect(() => {
    if (!session?.expiresAt) return;
    const check = () => {
      const remaining = new Date(session.expiresAt).getTime() - Date.now();
      setExpiryWarning(remaining > 0 && remaining < 900000); // 15 min
    };
    check();
    const id = setInterval(check, 30000);
    return () => clearInterval(id);
  }, [session]);

  // Online/offline listener
  useEffect(() => {
    const goOnline = () => setOnline(true);
    const goOffline = () => setOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => { window.removeEventListener('online', goOnline); window.removeEventListener('offline', goOffline); };
  }, [setOnline]);

  // Restore session from sessionStorage
  useEffect(() => {
    if (!session) {
      const stored = sessionStorage.getItem('gre_session');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (new Date(parsed.expiresAt) > new Date()) {
            useGREStore.getState().setSession(parsed);
          } else {
            sessionStorage.removeItem('gre_session');
            navigate('/');
          }
        } catch { navigate('/'); }
      }
    }
  }, [session, navigate]);

  const arrived = checkedIn.size;
  const expected = currentEvent.expectedCount;
  const velocity = getArrivalVelocity();
  const alerts = getAlerts();
  const delta = arrived - lastPushedCount;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: ICONS.activity },
    { id: 'scanner', label: 'Scanner', icon: ICONS.camera },
    { id: 'guests', label: 'Guest List', icon: ICONS.list },
    { id: 'activity', label: 'Activity', icon: ICONS.clock },
  ];

  return (
    <div
      className={`gre-root ${!isOnline ? 'offline' : ''} ${highContrast ? 'high-contrast' : ''}`}
      data-text-size={textSizeOffset}
    >
      <TopBar session={session} isOnline={isOnline} soundEnabled={soundEnabled}
        highContrast={highContrast} textSizeOffset={textSizeOffset} />

      {/* Session expiry warning */}
      {expiryWarning && (
        <div className="gre-session-banner">
          <span>⚠ Session expires in &lt;15 min</span>
          <button className="gre-pill amber" style={{ cursor: 'pointer', border: 'none' }}
            onClick={() => {
              const newExpiry = new Date(Date.now() + 12 * 3600000).toISOString();
              const newSession = { ...session, expiresAt: newExpiry };
              sessionStorage.setItem('gre_session', JSON.stringify(newSession));
              useGREStore.getState().setSession(newSession);
              setExpiryWarning(false);
            }}>
            Extend session
          </button>
        </div>
      )}

      {/* Headcount Ring */}
      <HeadcountRing arrived={arrived} expected={expected} />

      {/* Velocity */}
      <div className="gre-velocity">
        <span className="gre-velocity-text">Last 10 min: +{velocity} guests</span>
        {velocity > 10 && <span className="gre-pill amber">⚡ Rush mode</span>}
        {velocity === 0 && arrived > 0 && (
          <span className="gre-pill gold" style={{ fontSize: 11 }}>Arrivals paused</span>
        )}
      </div>

      {/* Alert Strip */}
      {alerts.length > 0 && (
        <div className="gre-alert-strip">
          {alerts.map((a, i) => (
            <button key={i}
              className={`gre-alert-pill gre-pill ${a.type === 'error' ? 'red' : a.type === 'warning' ? 'amber' : a.type === 'info' ? 'blue' : 'gold'}`}
              onClick={() => setAlertSheet(a)}>
              {a.text}
            </button>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="gre-actions">
        <button className="gre-btn primary" onClick={() => navigate('/gre/scanner')}>
          <Icon d={ICONS.camera} size={20} />
          Scan QR Code
        </button>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className="gre-btn secondary" style={{ flex: 1 }} onClick={() => navigate('/gre/walkin')}>
            <Icon d={ICONS.plus} size={18} /> Walk-in
          </button>
          <button className="gre-btn amber" style={{ flex: 1, position: 'relative' }}
            disabled={delta === 0 || headcountFrozen}
            onClick={() => navigate('/gre/live')}>
            <Icon d={ICONS.send} size={18} /> Kitchen
            {delta > 0 && <span className="gre-btn-badge">+{delta}</span>}
          </button>
        </div>
        <button className="gre-btn ghost" onClick={() => navigate('/gre/guests')}>
          <Icon d={ICONS.list} size={16} /> View Guest List ({arrived}/{expected})
        </button>
      </div>

      {/* Alert Detail Sheet */}
      {alertSheet && (
        <>
          <div className="gre-sheet-overlay" onClick={() => setAlertSheet(null)} />
          <div className="gre-sheet">
            <div className="gre-sheet-handle" />
            <h3 style={{ color: alertSheet.type === 'error' ? 'var(--gre-error)' : alertSheet.type === 'warning' ? 'var(--gre-warning)' : 'var(--gre-info)' }}>
              <Icon d={ICONS.alert} size={20} /> Alert Detail
            </h3>
            <p style={{ fontSize: 15, color: 'var(--gre-text)', marginBottom: 8 }}>{alertSheet.text}</p>
            <p style={{ fontSize: 13, color: 'var(--gre-text-dim)' }}>
              This alert is automatically generated based on real-time event conditions.
            </p>
            <div className="gre-sheet-actions">
              <button className="gre-sheet-btn ghost" onClick={() => setAlertSheet(null)}>Dismiss</button>
            </div>
          </div>
        </>
      )}

      {/* Bottom Nav */}
      <div className="gre-bottom-nav">
        {tabs.map(t => (
          <button key={t.id}
            className={`gre-nav-tab ${activeTab === t.id ? 'active' : ''}`}
            onClick={() => {
              setActiveTab(t.id);
              if (t.id === 'scanner') navigate('/gre/scanner');
              else if (t.id === 'guests') navigate('/gre/guests');
              else if (t.id === 'activity') navigate('/gre/live');
            }}>
            <Icon d={t.icon} size={20} />
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
