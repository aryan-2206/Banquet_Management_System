import React, { useState, useEffect } from 'react';
import { daysUntil, STATUS_CONFIG, EVENT_TYPE_EMOJI } from './mockData';

const Icon = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const ICONS = {
  menu:    'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 0 2-2h2a2 2 0 0 0 2 2',
  pay:     'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  users:   'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75',
  contact: 'M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12 19.79 19.79 0 0 1 1.09 3.41 2 2 0 0 1 3.07 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 21 16.92z',
  warning: 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
};

function Countdown({ targetDate }) {
  const [secs, setSecs] = useState(Math.max(0, Math.floor((new Date(targetDate) - new Date()) / 1000)));
  useEffect(() => {
    const id = setInterval(() => setSecs(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  const d = Math.floor(secs / 86400), h = Math.floor((secs % 86400) / 3600),
        m = Math.floor((secs % 3600) / 60), s = secs % 60;
  const pad = n => String(n).padStart(2, '0');
  return (
    <div className="flex gap-2 justify-center md:justify-start flex-wrap">
      {[['Days', pad(d)], ['Hours', pad(h)], ['Min', pad(m)], ['Sec', pad(s)]].map(([l, v]) => (
        <div key={l} className="text-center">
          <div className="font-serif text-4xl md:text-5xl lg:text-6xl font-black text-[#C9A84C] leading-none px-3 py-2 rounded-xl min-w-[56px]"
            style={{ background:'rgba(201,168,76,0.12)', border:'1px solid rgba(201,168,76,0.25)' }}>
            {v}
          </div>
          <div className="text-[9px] text-[#6B5520] tracking-[0.12em] uppercase mt-1">{l}</div>
        </div>
      ))}
    </div>
  );
}

export default function HeroGreeting({ client, nextEvent, onQuickAction }) {
  if (!nextEvent) return null;
  const st = STATUS_CONFIG[nextEvent.status] || STATUS_CONFIG.confirmed;
  const days = daysUntil(nextEvent.date);
  const overdue = nextEvent.instalments?.some(i => i.status === 'overdue');

  const QUICK_ACTIONS = [
    { label: 'View Menu',   icon: ICONS.menu,    action: 'menu',     color: '#C9A84C' },
    { label: 'Pay Now',     icon: ICONS.pay,     action: 'payments', color: '#5FBF8A' },
    { label: 'Add Guests',  icon: ICONS.users,   action: 'guests',   color: '#9B6DE8' },
    { label: 'Contact Mgr', icon: ICONS.contact, action: 'support',  color: '#5B8FE8' },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl md:rounded-3xl p-6 md:p-8 mb-4"
      style={{ background:'linear-gradient(160deg,rgba(201,168,76,0.1) 0%,rgba(8,8,16,0.6) 100%)', border:'1px solid rgba(201,168,76,0.2)' }}>

      {/* Ambient orb */}
      <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full pointer-events-none"
        style={{ background:'radial-gradient(circle,rgba(201,168,76,0.15) 0%,transparent 70%)', filter:'blur(30px)' }} />

      {/* Status + account ID row */}
      <div className="flex items-center justify-between mb-5">
        <div className="text-[9px] text-[#C9A84C] tracking-[0.2em] uppercase">Client Portal</div>
        <span className="text-xs px-3 py-1 rounded-full font-medium"
          style={{ background: st.bg, color: st.color, border:`1px solid ${st.border}` }}>
          {st.label}
        </span>
      </div>

      {/* ── Responsive layout: stacked mobile → 2-col tablet → 3-col desktop ── */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between lg:gap-8 gap-5">

        {/* LEFT: Greeting */}
        <div className="md:flex-1">
          <div className="text-3xl mb-2 text-center md:text-left">{EVENT_TYPE_EMOJI[nextEvent.type] || '🎉'}</div>
          <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-[#F5F0E8] leading-tight text-center md:text-left mb-1">
            Welcome back,<br />
            <span className="text-[#C9A84C]">{client.name}</span>
          </h1>
          <p className="text-sm md:text-base text-[#9D9880] text-center md:text-left">
            {days > 0 ? `Your event is in ${days} day${days !== 1 ? 's' : ''}` : days === 0 ? '🎊 Your event is TODAY!' : 'Your event has passed'}
          </p>
        </div>

        {/* CENTER: Countdown */}
        {days > 0 && days <= 30 && (
          <div className="md:flex-1 flex justify-center">
            <Countdown targetDate={`${nextEvent.date}T${nextEvent.time}`} />
          </div>
        )}

        {/* RIGHT: Quick actions — 2x2 grid mobile, column desktop */}
        <div className="md:flex-shrink-0">
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
            {QUICK_ACTIONS.map(({ label, icon, action, color }) => (
              <button key={label} onClick={() => onQuickAction(action)}
                className="flex items-center gap-2 py-3 px-4 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200 hover:brightness-110 active:scale-95 min-h-[44px]"
                style={{ background:`${color}12`, border:`1px solid ${color}30`, color }}>
                <Icon d={icon} size={15} />
                <span className="whitespace-nowrap">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overdue alert */}
      {overdue && (
        <div className="flex items-center gap-2 mt-4 rounded-xl px-4 py-3 text-sm text-[#E85555]"
          style={{ background:'rgba(232,85,85,0.1)', border:'1px solid rgba(232,85,85,0.3)' }}>
          <Icon d={ICONS.warning} size={14} />
          Payment overdue — please clear balance before your event.
        </div>
      )}
    </div>
  );
}
