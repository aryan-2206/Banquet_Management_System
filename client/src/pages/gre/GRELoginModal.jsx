import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../finance/useAuthStore';
import useGREStore from './useGREStore';

/* ── Shield SVG icon ── */
const ShieldIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#C9A84C"
    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

/* ── Eye icons ── */
const EyeIcon = ({ open }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
        <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

export default function GRELoginModal({ open, onClose }) {
  const navigate = useNavigate();
  const login = useAuthStore(s => s.login);
  const clearError = useAuthStore(s => s.clearError);
  const loginError = useAuthStore(s => s.loginError);
  const setSession = useGREStore(s => s.setSession);

  const [staffId, setStaffId] = useState('');
  const [password, setPassword] = useState('');
  const [eventPin, setEventPin] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [showFlash, setShowFlash] = useState(false);
  const [fieldError, setFieldError] = useState(null); // 'staffId' | 'password' | 'pin'

  const staffIdRef = useRef();
  const overlayRef = useRef();
  const pinInputs = useRef([]);

  // Reset on open
  useEffect(() => {
    if (open) {
      setStaffId(''); setPassword(''); setEventPin('');
      setShowPw(false); setFieldError(null); clearError();
      setTimeout(() => staffIdRef.current?.focus(), 200);
    }
  }, [open]);

  // ESC to close
  useEffect(() => {
    const h = e => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    setFieldError(null);

    // Validate event PIN (demo: any 4 digits accepted)
    if (eventPin.length !== 4 || !/^\d{4}$/.test(eventPin)) {
      setFieldError('pin');
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    setLoading(true);
    await new Promise(r => setTimeout(r, 600)); // auth delay feel

    const result = login(staffId, password);
    setLoading(false);

    if (result.ok) {
      // Must be gre or admin role
      if (result.user.role !== 'gre' && result.user.role !== 'admin') {
        setShake(true);
        setTimeout(() => setShake(false), 500);
        useAuthStore.setState({ loginError: 'Insufficient permissions for GRE access.' });
        setFieldError('staffId');
        return;
      }

      // Create GRE session
      const session = {
        staffId: result.user.username,
        staffName: result.user.name,
        initials: result.user.initials,
        role: result.user.role,
        eventPin,
        loginAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 12 * 3600000).toISOString(),
      };
      sessionStorage.setItem('gre_session', JSON.stringify(session));
      setSession(session);

      // Cinematic flash transition
      setShowFlash(true);
      setTimeout(() => {
        onClose?.();
        navigate('/gre');
      }, 350);
      setTimeout(() => setShowFlash(false), 600);
    } else {
      setShake(true);
      setFieldError('password');
      setTimeout(() => setShake(false), 500);
    }
  }

  if (!open && !showFlash) return null;

  return (
    <>
      {showFlash && <div className="gre-flash" />}
      {open && (
        <div
          ref={overlayRef}
          className="gre-login-overlay"
          onClick={e => { if (e.target === overlayRef.current) onClose?.(); }}
        >
          <div className={`gre-login-card ${shake ? 'shake' : ''}`}>
            {/* Glow orb */}
            <div style={{
              position: 'absolute', top: -60, right: -60,
              width: 200, height: 200, borderRadius: '50%',
              background: 'radial-gradient(circle, #C9A84C, transparent 70%)',
              filter: 'blur(40px)', opacity: .1, pointerEvents: 'none',
            }} />

            {/* Header */}
            <div style={{ marginBottom: 24, position: 'relative' }}>
              <div style={{ marginBottom: 14 }}><ShieldIcon /></div>
              <p style={{ fontSize: 11, color: '#C9A84C', letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 6 }}>
                Staff Authentication
              </p>
              <h2 style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: '1.6rem', fontWeight: 700, color: '#F5F0E8', marginBottom: 6,
              }}>
                GRE Staff Access
              </h2>
              <p style={{ fontSize: 13, color: '#4A4840', lineHeight: 1.5 }}>
                Enter your credentials and tonight's event PIN to access Guest Relations.
              </p>
            </div>

            {/* Demo hint */}
            <div style={{
              background: 'rgba(201,168,76,.08)', border: '1px solid rgba(201,168,76,.15)',
              borderRadius: 8, padding: '8px 12px', marginBottom: 20,
              fontSize: 12, color: '#9D9880', display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ color: '#C9A84C' }}>ℹ</span>
              Demo: <code style={{ color: '#C9A84C', background: 'rgba(201,168,76,.12)', padding: '1px 6px', borderRadius: 4 }}>gre</code> /
              <code style={{ color: '#C9A84C', background: 'rgba(201,168,76,.12)', padding: '1px 6px', borderRadius: 4 }}>gre123</code> ·
              PIN: <code style={{ color: '#C9A84C', background: 'rgba(201,168,76,.12)', padding: '1px 6px', borderRadius: 4 }}>1234</code>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Staff ID */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 12, color: '#9D9880', letterSpacing: '.04em' }}>Staff ID</label>
                <input
                  ref={staffIdRef}
                  type="text" value={staffId}
                  onChange={e => { setStaffId(e.target.value); clearError(); setFieldError(null); }}
                  placeholder="Staff ID or email"
                  className={`gre-login-input ${fieldError === 'staffId' ? 'error' : ''}`}
                  autoComplete="username"
                />
              </div>

              {/* Password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 12, color: '#9D9880', letterSpacing: '.04em' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPw ? 'text' : 'password'} value={password}
                    onChange={e => { setPassword(e.target.value); clearError(); setFieldError(null); }}
                    placeholder="••••••••"
                    className={`gre-login-input ${fieldError === 'password' ? 'error' : ''}`}
                    style={{ paddingRight: 44 }}
                    autoComplete="current-password"
                  />
                  <button type="button" onClick={() => setShowPw(v => !v)}
                    style={{
                      position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                      background: 'none', border: 'none', color: '#4A4840', cursor: 'pointer',
                    }}
                    aria-label={showPw ? 'Hide password' : 'Show password'}>
                    <EyeIcon open={showPw} />
                  </button>
                </div>
              </div>

              {/* Event PIN */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <label style={{ fontSize: 12, color: '#9D9880', letterSpacing: '.04em' }}>Event PIN (4-digit)</label>
                <input
                  type="text" value={eventPin} maxLength={4}
                  onChange={e => {
                    const v = e.target.value.replace(/\D/g, '').slice(0, 4);
                    setEventPin(v); setFieldError(null);
                  }}
                  placeholder="● ● ● ●"
                  className={`gre-login-input ${fieldError === 'pin' ? 'error' : ''}`}
                  style={{ textAlign: 'center', letterSpacing: '0.5em', fontSize: 20, fontWeight: 700 }}
                  inputMode="numeric" autoComplete="one-time-code"
                />
              </div>

              {/* Error */}
              {loginError && (
                <div style={{
                  background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.3)',
                  borderRadius: 8, padding: '9px 12px',
                  fontSize: 13, color: '#ef4444', display: 'flex', gap: 8, alignItems: 'center',
                }}>
                  <span>✕</span> {loginError}
                </div>
              )}

              {/* Submit */}
              <button type="submit" className="gre-login-submit"
                disabled={loading || !staffId || !password || eventPin.length < 4}>
                {loading ? (
                  <><span style={{ display: 'inline-block', animation: 'gre-spin .6s linear infinite', fontSize: 16 }}>◌</span> Authenticating…</>
                ) : (
                  'Sign In to GRE →'
                )}
              </button>

              {/* Cancel */}
              <button type="button" onClick={onClose}
                style={{
                  padding: 10, borderRadius: 10,
                  background: 'transparent', border: '1px solid rgba(255,255,255,.07)',
                  color: '#4A4840', fontFamily: "'Outfit',sans-serif", fontSize: 13,
                  cursor: 'pointer', transition: 'all .2s',
                }}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
