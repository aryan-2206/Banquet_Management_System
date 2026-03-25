import { useState, useEffect, useRef } from 'react';
import useAuthStore from './finance/useAuthStore';

const ROLE_META = {
  finance:  { color: '#5FBF8A', label: 'Finance Manager', icon: '₹' },
  sales:    { color: '#5B8FE8', label: 'Sales Manager',   icon: '◈' },
  admin:    { color: '#E85E9A', label: 'Admin / AI',      icon: '⊗' },
  kitchen:  { color: '#E85555', label: 'Kitchen / Ops',   icon: '⊕' },
  gre:      { color: '#C9A84C', label: 'Guest Relations', icon: '⊙' },
  dj:       { color: '#E8C455', label: 'DJ Interface',    icon: '◉' },
  client:   { color: '#9B6DE8', label: 'Client Portal',   icon: '◎' },
};

/**
 * LoginModal — shown when a module card is clicked on the landing page.
 *
 * Props:
 *   open        {boolean}    — show/hide
 *   targetRole  {string}     — which role this modal is for ('finance', 'sales', …)
 *   onClose     {function}   — called to dismiss without logging in
 *   onSuccess   {function}   — called with { user } when login succeeds
 */
export default function LoginModal({ open, targetRole, onClose, onSuccess }) {
  const login      = useAuthStore((s) => s.login);
  const loginError = useAuthStore((s) => s.loginError);
  const clearError = useAuthStore((s) => s.clearError);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [shake, setShake]       = useState(false);
  const usernameRef             = useRef();
  const overlayRef              = useRef();

  const meta = ROLE_META[targetRole] || ROLE_META.finance;

  // Reset form when opened
  useEffect(() => {
    if (open) {
      setUsername('');
      setPassword('');
      setShowPw(false);
      clearError();
      setTimeout(() => usernameRef.current?.focus(), 120);
    }
  }, [open]);

  // ESC closes
  useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose?.(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    // Tiny artificial delay — feels more auth-like
    await new Promise((r) => setTimeout(r, 480));
    const result = login(username, password);
    setLoading(false);

    if (result.ok) {
      // Enforce role match — even if creds are correct for another role
      if (result.user.role !== targetRole) {
        setShake(true);
        setTimeout(() => setShake(false), 600);
        useAuthStore.getState().clearError();
        useAuthStore.setState({ loginError: `These credentials are not for the ${meta.label} module.` });
        return;
      }
      onSuccess?.(result.user);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  }

  if (!open) return null;

  return (
    <div
      ref={overlayRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(8,8,16,.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
        animation: 'fadeIn .25s ease',
      }}
      onClick={(e) => { if (e.target === overlayRef.current) onClose?.(); }}
    >
      <style>{`
        @keyframes fadeIn   { from{opacity:0} to{opacity:1} }
        @keyframes scaleIn  { from{opacity:0;transform:scale(.93) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes shake    { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)} }
        .lm-shake           { animation: shake .5s ease !important; }
      `}</style>

      <div
        className={shake ? 'lm-shake' : ''}
        style={{
          width: 'min(440px, 96vw)',
          background: 'linear-gradient(160deg, #0E0E1A 0%, #161624 100%)',
          border: `1px solid ${meta.color}35`,
          borderRadius: 24,
          padding: 36,
          boxShadow: `0 32px 80px rgba(0,0,0,.6), 0 0 0 1px ${meta.color}10`,
          animation: 'scaleIn .3s cubic-bezier(.4,0,.2,1)',
          position: 'relative', overflow: 'hidden',
        }}
      >
        {/* Glow orb */}
        <div style={{
          position: 'absolute', top: -60, right: -60,
          width: 200, height: 200, borderRadius: '50%',
          background: `radial-gradient(circle, ${meta.color}, transparent 70%)`,
          filter: 'blur(40px)', opacity: .1, pointerEvents: 'none',
        }} />

        {/* Header */}
        <div style={{ marginBottom: 28, position: 'relative' }}>
          {/* Role icon */}
          <div style={{
            width: 52, height: 52, borderRadius: 14, marginBottom: 16,
            background: `${meta.color}18`,
            border: `1px solid ${meta.color}35`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.3rem', color: meta.color,
          }}>
            {meta.icon}
          </div>

          <p style={{ fontSize: 11, color: meta.color, letterSpacing: '.2em', textTransform: 'uppercase', marginBottom: 6 }}>
            Authentication Required
          </p>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '1.6rem', fontWeight: 700, color: '#F5F0E8', marginBottom: 6,
          }}>
            {meta.label}
          </h2>
          <p style={{ fontSize: 13, color: '#4A4840', lineHeight: 1.5 }}>
            Enter your credentials to access this module. Access is restricted to authorised staff only.
          </p>
        </div>

        {/* Hint chip */}
        <div style={{
          background: `${meta.color}0D`, border: `1px solid ${meta.color}20`,
          borderRadius: 8, padding: '8px 12px', marginBottom: 24,
          fontSize: 12, color: '#9D9880',
          display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <span style={{ color: meta.color }}>ℹ</span>
          Demo: use username <code style={{ color: meta.color, background: `${meta.color}12`, padding: '1px 6px', borderRadius: 4 }}>{targetRole}</code> ·
          password <code style={{ color: meta.color, background: `${meta.color}12`, padding: '1px 6px', borderRadius: 4 }}>{targetRole}123</code>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Username */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, color: '#9D9880', letterSpacing: '.04em' }}>Username</label>
            <input
              ref={usernameRef}
              type="text" value={username}
              onChange={(e) => { setUsername(e.target.value); clearError(); }}
              autoComplete="username"
              placeholder={targetRole}
              style={{
                background: 'rgba(255,255,255,.04)', border: loginError ? '1px solid rgba(232,85,85,.5)' : '1px solid rgba(201,168,76,.15)',
                borderRadius: 10, padding: '11px 14px', color: '#F5F0E8',
                fontFamily: "'Outfit', sans-serif", fontSize: 14, outline: 'none',
                transition: 'border-color .2s',
              }}
              onFocus={(e) => e.target.style.borderColor = `${meta.color}60`}
              onBlur={(e)  => e.target.style.borderColor = loginError ? 'rgba(232,85,85,.5)' : 'rgba(201,168,76,.15)'}
            />
          </div>

          {/* Password */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, color: '#9D9880', letterSpacing: '.04em' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'} value={password}
                onChange={(e) => { setPassword(e.target.value); clearError(); }}
                autoComplete="current-password"
                placeholder="••••••••"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,.04)', border: loginError ? '1px solid rgba(232,85,85,.5)' : '1px solid rgba(201,168,76,.15)',
                  borderRadius: 10, padding: '11px 44px 11px 14px', color: '#F5F0E8',
                  fontFamily: "'Outfit', sans-serif", fontSize: 14, outline: 'none',
                  transition: 'border-color .2s',
                }}
                onFocus={(e) => e.target.style.borderColor = `${meta.color}60`}
                onBlur={(e)  => e.target.style.borderColor = loginError ? 'rgba(232,85,85,.5)' : 'rgba(201,168,76,.15)'}
              />
              <button type="button"
                onClick={() => setShowPw((v) => !v)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', color: '#4A4840', cursor: 'pointer', fontSize: 13,
                }}
                aria-label={showPw ? 'Hide password' : 'Show password'}
              >
                {showPw ? '🙈' : '👁'}
              </button>
            </div>
          </div>

          {/* Error */}
          {loginError && (
            <div style={{
              background: 'rgba(232,85,85,.08)', border: '1px solid rgba(232,85,85,.3)',
              borderRadius: 8, padding: '9px 12px',
              fontSize: 13, color: '#E85555', display: 'flex', gap: 8, alignItems: 'center',
            }}>
              <span>✕</span> {loginError}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit" disabled={loading || !username || !password}
            style={{
              marginTop: 4, padding: '12px', borderRadius: 10, border: 'none',
              background: loading || !username || !password
                ? 'rgba(255,255,255,.06)'
                : `linear-gradient(135deg, ${meta.color}, ${meta.color}99)`,
              color: loading || !username || !password ? '#4A4840' : '#080810',
              fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 14,
              cursor: loading || !username || !password ? 'not-allowed' : 'pointer',
              transition: 'all .2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
            onMouseEnter={(e) => {
              if (!loading && username && password) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${meta.color}35`; }
            }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
          >
            {loading
              ? <><span style={{ display: 'inline-block', animation: 'spin-slow .6s linear infinite', fontSize: 16 }}>◌</span> Authenticating…</>
              : `Sign In to ${meta.label} →`
            }
          </button>

          <button type="button" onClick={onClose}
            style={{
              padding: '10px', borderRadius: 10,
              background: 'transparent', border: '1px solid rgba(255,255,255,.07)',
              color: '#4A4840', fontFamily: "'Outfit', sans-serif", fontSize: 13,
              cursor: 'pointer', transition: 'all .2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#9D9880'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.15)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#4A4840'; e.currentTarget.style.borderColor = 'rgba(255,255,255,.07)'; }}
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
}
