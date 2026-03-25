import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Icon = ({ d, size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"
    strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);

const ICONS = {
  calendar:  'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z',
  finance:   'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  users:     'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  check:     'M20 6 9 17l-5-5',
  warning:   'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
  edit:      'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z',
  lock:      'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4',
  whatsapp:  'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z',
  kitchen:   'M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6zM6 17h12',
  arrow:     'M19 12H5M12 5l7 7-7 7',
};

function Countdown({ targetDate }) {
  const [time, setTime] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const tick = () => {
      const diff = new Date(targetDate) - new Date();
      if (diff <= 0) { setTime({ days:0,hours:0,minutes:0,seconds:0 }); return; }
      setTime({ days: Math.floor(diff/86400000), hours: Math.floor((diff%86400000)/3600000),
        minutes: Math.floor((diff%3600000)/60000), seconds: Math.floor((diff%60000)/1000) });
    };
    tick(); const id = setInterval(tick, 1000); return () => clearInterval(id);
  }, [targetDate]);
  const pad = n => String(n).padStart(2,'0');
  return (
    <div className="flex gap-2 justify-center flex-wrap mt-4">
      {[['Days',pad(time.days)],['Hours',pad(time.hours)],['Min',pad(time.minutes)],['Sec',pad(time.seconds)]].map(([l,v]) => (
        <div key={l} className="text-center">
          <div className="font-serif text-3xl md:text-4xl lg:text-5xl font-black text-[#C9A84C] px-3 py-2 rounded-xl min-w-[54px]"
            style={{ background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.25)' }}>{v}</div>
          <div className="text-[9px] text-[#6B5520] tracking-[0.12em] uppercase mt-1">{l}</div>
        </div>
      ))}
    </div>
  );
}

/* Modal — bottom sheet on mobile, centered on md+ */
function PaxChangeModal({ contracted, onClose, onSubmit }) {
  const [newPax, setNewPax] = useState(contracted);
  const [reason, setReason] = useState('');
  const inp = "w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(201,168,76,0.2)] rounded-xl px-4 py-3 text-[#F5F0E8] text-sm outline-none focus:border-[rgba(201,168,76,0.5)] transition-colors";

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center"
      style={{ background:'rgba(8,8,16,0.85)', backdropFilter:'blur(8px)' }}
      onClick={onClose}>
      <div className="w-full md:max-w-lg md:mx-4 rounded-t-3xl md:rounded-3xl p-6 md:p-8"
        style={{ background:'#12121F', border:'1px solid rgba(201,168,76,0.2)', animation:'slideUp 0.35s cubic-bezier(0.22,1,0.36,1)' }}
        onClick={e => e.stopPropagation()}>
        {/* Drag handle — mobile only */}
        <div className="w-9 h-1 rounded-full mx-auto mb-6 md:hidden" style={{ background:'rgba(201,168,76,0.3)' }} />
        <h3 className="font-serif text-xl md:text-2xl text-[#F5F0E8] mb-2">Request Pax Change</h3>
        <p className="text-sm text-[#9D9880] mb-5">Changes trigger alerts to Finance & Kitchen. Subject to approval.</p>

        {/* 2-col form on md+ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-xs text-[#9D9880] mb-2">New Guest Count</label>
            <input type="number" value={newPax} onChange={e => setNewPax(e.target.value)} min={1} className={inp} />
          </div>
          <div className="md:col-span-1">
            <label className="block text-xs text-[#9D9880] mb-2">Reason for Change</label>
            <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3}
              placeholder="e.g. More family attending than expected…" className={`${inp} resize-none`} />
          </div>
        </div>

        <button onClick={() => onSubmit(newPax, reason)}
          className="w-full py-3.5 rounded-xl font-semibold text-sm cursor-pointer border-none transition-all hover:brightness-110 min-h-[48px]"
          style={{ background:'linear-gradient(135deg,#C9A84C,#8B6520)', color:'#080810' }}>
          Send Request →
        </button>
      </div>
    </div>
  );
}

export default function EventSummary() {
  const [showPaxModal, setShowPaxModal] = useState(false);
  const [paxRequested, setPaxRequested] = useState(false);
  const [specialNote, setSpecialNote]   = useState('');
  const [editingNote, setEditingNote]   = useState(false);

  const event = {
    name: 'Sharma — Gupta Wedding Reception',
    venue: 'Grand Maharaja Hall',
    date: '2026-04-08T18:00:00',
    menuTier: 'Elite Package',
    contractedPax: 350,
    totalCost: 875000,
    paid: 437500,
    instalments: [
      { label: 'Advance (50%)', amount: 437500, due: '2026-03-10', status: 'paid' },
      { label: 'Final Balance', amount: 437500, due: '2026-04-06', status: 'pending' },
    ],
    timeline: [
      { time: '15:00', label: 'Venue Setup & Décor',      color: '#5B8FE8' },
      { time: '17:30', label: 'Sound Check & DJ Setup',    color: '#E8C455' },
      { time: '18:00', label: 'Guest Arrival & Check-In',  color: '#C9A84C' },
      { time: '19:30', label: 'Welcome Dinner Service',    color: '#5FBF8A' },
      { time: '21:00', label: 'Cake Ceremony & Music',     color: '#9B6DE8' },
      { time: '23:30', label: 'Event Close & Thank You',   color: '#E85E9A' },
    ],
  };

  const balance  = event.totalCost - event.paid;
  const paidPct  = Math.round((event.paid / event.totalCost) * 100);
  const daysLeft = Math.ceil((new Date(event.date) - new Date()) / 86400000);
  const locked   = daysLeft <= 2;
  const fmt      = n => '₹' + n.toLocaleString('en-IN');

  const card = "portal-card";

  return (
    <div className="min-h-screen bg-[#080810] font-sans text-[#F5F0E8]">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ background:'radial-gradient(ellipse 80% 50% at 50% 0%,rgba(201,168,76,0.07) 0%,transparent 60%)' }} />
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ backgroundImage:'linear-gradient(rgba(201,168,76,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(201,168,76,.03) 1px,transparent 1px)', backgroundSize:'60px 60px' }} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');
        @keyframes slideUp { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:translateY(0)} }
        @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .portal-card { background:rgba(255,255,255,0.03); border:1px solid rgba(201,168,76,0.12); border-radius:1.25rem; padding:1.25rem; margin-bottom:1rem; backdrop-filter:blur(16px); }
        .portal-section-label { font-size:10px; color:#C9A84C; letter-spacing:0.2em; text-transform:uppercase; margin-bottom:0.875rem; display:block; }
        input:focus, textarea:focus { border-color:rgba(201,168,76,0.5)!important; outline:none; }
      `}</style>

      <div className="relative z-10">
        {/* ── Header ── */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-4 md:px-8 py-3"
          style={{ background:'rgba(8,8,16,0.9)', backdropFilter:'blur(20px)', borderBottom:'1px solid rgba(201,168,76,0.1)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-[#080810]"
              style={{ background:'linear-gradient(135deg,#C9A84C,#6B5520)' }}>B</div>
            <div>
              <div className="font-serif text-base font-bold text-[#F5F0E8]">Banquet <span className="text-[#C9A84C]">IM</span></div>
              <div className="text-[8px] text-[#6B5520] tracking-[0.2em] uppercase -mt-0.5">Client Portal</div>
            </div>
            {locked && (
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs text-[#E85555]"
                style={{ background:'rgba(232,85,85,0.12)', border:'1px solid rgba(232,85,85,0.3)' }}>
                <Icon d={ICONS.lock} size={10} /> Locked
              </div>
            )}
          </div>
          <Link to="/portal" className="text-xs text-[#9D9880] no-underline flex items-center gap-1">
            <Icon d={ICONS.arrow} size={12} className="rotate-180" /> Dashboard
          </Link>
        </div>

        {/* ── Content: max-width expands at lg ── */}
        <div className="max-w-xl md:max-w-2xl lg:max-w-3xl mx-auto px-4 md:px-6 lg:px-8 pt-6 pb-16">

          {/* Hero banner */}
          <div className="relative overflow-hidden rounded-2xl p-6 md:p-8 mb-4 text-center"
            style={{ background:'linear-gradient(160deg,rgba(201,168,76,0.08) 0%,rgba(8,8,16,0.6) 100%)', border:'1px solid rgba(201,168,76,0.2)' }}>
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full pointer-events-none"
              style={{ background:'radial-gradient(circle,rgba(201,168,76,0.12) 0%,transparent 70%)', filter:'blur(30px)' }} />
            <div className="text-[9px] text-[#C9A84C] tracking-[0.25em] uppercase mb-2">Your Upcoming Event</div>
            <h1 className="font-serif text-2xl md:text-3xl lg:text-4xl font-bold text-[#F5F0E8] leading-tight mb-2">{event.name}</h1>
            <div className="text-sm text-[#9D9880] mb-1">{event.venue}</div>
            <div className="text-sm text-[#C9A84C] font-medium">
              {new Date(event.date).toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
              &nbsp;·&nbsp;{new Date(event.date).toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' })}
            </div>
            {daysLeft > 0 ? <Countdown targetDate={event.date} /> : <div className="mt-3 text-[#5FBF8A] text-sm">🎉 Event Day!</div>}
          </div>

          {/* ── Responsive 2-col grid for cards on lg ── */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-4 lg:items-start">

            {/* Left column */}
            <div>
              {/* Financial Status */}
              <div className={card}>
                <span className="portal-section-label">Financial Status</span>
                {/* Progress */}
                <div className="h-1.5 rounded-full overflow-hidden mb-4" style={{ background:'rgba(255,255,255,0.06)' }}>
                  <div className="h-full rounded-full transition-all duration-1000"
                    style={{ width:`${paidPct}%`, background:'linear-gradient(90deg,#5FBF8A,#C9A84C)' }} />
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label:'Total Cost', val:fmt(event.totalCost), color:'#F5F0E8' },
                    { label:'Paid',       val:fmt(event.paid),      color:'#5FBF8A'  },
                    { label:'Balance',    val:fmt(balance),         color: balance > 0 ? '#E8C455' : '#5FBF8A' },
                  ].map(({ label, val, color }) => (
                    <div key={label} className="text-center">
                      <div className="text-xs text-[#6B6858] mb-1">{label}</div>
                      <div className="text-sm md:text-base lg:text-lg font-semibold" style={{ color }}>{val}</div>
                    </div>
                  ))}
                </div>
                {/* Instalments */}
                <div className="border-t border-[rgba(201,168,76,0.1)] pt-4 space-y-0">
                  {event.instalments.map((inst, i) => (
                    <div key={i} className="flex items-center justify-between py-2.5 border-b border-[rgba(255,255,255,0.04)] last:border-0">
                      <div>
                        <div className="text-sm text-[#F5F0E8]">{inst.label}</div>
                        <div className="text-xs text-[#4A4840]">Due: {new Date(inst.due).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#F5F0E8]">{fmt(inst.amount)}</span>
                        <span className="text-[10px] rounded-full px-3 py-0.5"
                          style={{ background: inst.status==='paid' ? 'rgba(95,191,138,0.15)' : 'rgba(232,197,85,0.15)', color: inst.status==='paid' ? '#5FBF8A' : '#E8C455', border:`1px solid ${inst.status==='paid' ? 'rgba(95,191,138,0.3)' : 'rgba(232,197,85,0.3)'}` }}>
                          {inst.status === 'paid' ? '✓ Paid' : 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {balance > 0 && !locked && (
                  <button className="mt-4 w-full py-3.5 rounded-xl font-semibold text-sm border-none cursor-pointer transition-all hover:brightness-110 min-h-[48px]"
                    style={{ background:'linear-gradient(135deg,#C9A84C,#8B6520)', color:'#080810' }}>
                    Pay Balance {fmt(balance)} →
                  </button>
                )}
              </div>

              {/* Special Requests */}
              <div className={card}>
                <div className="flex items-center justify-between mb-3">
                  <span className="portal-section-label mb-0">Special Requests</span>
                  {!locked && (
                    <button onClick={() => setEditingNote(v => !v)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs cursor-pointer transition-all hover:brightness-110 min-h-[32px]"
                      style={{ background:'rgba(201,168,76,0.08)', border:'1px solid rgba(201,168,76,0.2)', color:'#C9A84C' }}>
                      <Icon d={ICONS.edit} size={11} /> {editingNote ? 'Save' : 'Edit'}
                    </button>
                  )}
                </div>
                {editingNote ? (
                  <textarea value={specialNote} onChange={e => setSpecialNote(e.target.value)}
                    rows={3} placeholder="e.g. Jain-only starters, rose petal entrance…"
                    className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(201,168,76,0.2)] rounded-xl px-4 py-3 text-[#F5F0E8] text-sm resize-none outline-none" />
                ) : (
                  <p className="text-sm leading-relaxed" style={{ color: specialNote ? '#F5F0E8' : '#4A4840' }}>
                    {specialNote || 'No special requests added yet.'}
                  </p>
                )}
              </div>
            </div>

            {/* Right column */}
            <div>
              {/* Booking Details */}
              <div className={card}>
                <span className="portal-section-label">Booking Details</span>
                <div className="space-y-0">
                  {[
                    { icon: ICONS.calendar, label:'Menu Tier',      val:event.menuTier,            color:'#C9A84C' },
                    { icon: ICONS.users,    label:'Contracted Pax', val:`${event.contractedPax} Guests`, color:'#9B6DE8' },
                    { icon: ICONS.whatsapp, label:'WhatsApp Link',  val:'Sent via WhatsApp',        color:'#25D366' },
                  ].map(({ icon, label, val, color }) => (
                    <div key={label} className="flex items-center gap-3 py-3 border-b border-[rgba(255,255,255,0.04)] last:border-0">
                      <div className="w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center"
                        style={{ background:`${color}15`, border:`1px solid ${color}30`, color }}>
                        <Icon d={icon} size={15} />
                      </div>
                      <div>
                        <div className="text-xs text-[#6B6858]">{label}</div>
                        <div className="text-sm text-[#F5F0E8]">{val}</div>
                      </div>
                    </div>
                  ))}
                </div>
                {!locked ? (
                  <button onClick={() => setShowPaxModal(true)}
                    className="mt-4 w-full py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-medium cursor-pointer transition-all hover:brightness-110 min-h-[44px]"
                    style={{ border:'1px solid rgba(155,109,232,0.3)', background:'rgba(155,109,232,0.07)', color:'#9B6DE8' }}>
                    <Icon d={ICONS.users} size={14} />
                    {paxRequested ? '✓ Pax Change Requested' : 'Request Pax Change'}
                  </button>
                ) : (
                  <div className="mt-3 flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-[#E85555]"
                    style={{ background:'rgba(232,85,85,0.08)', border:'1px solid rgba(232,85,85,0.2)' }}>
                    <Icon d={ICONS.warning} size={13} /> Event is locked. Contact us for changes.
                  </div>
                )}
              </div>

              {/* Event Timeline */}
              <div className={card}>
                <span className="portal-section-label">Event Timeline</span>
                <div className="relative pl-5">
                  <div className="absolute left-1.5 top-2 bottom-2 w-px"
                    style={{ background:'linear-gradient(180deg,rgba(201,168,76,0.4) 0%,rgba(201,168,76,0.05) 100%)' }} />
                  {event.timeline.map((item, i) => (
                    <div key={i} className="relative flex items-start gap-4 mb-5 last:mb-0">
                      <div className="absolute -left-3.5 top-1 w-2.5 h-2.5 rounded-full"
                        style={{ background:item.color, boxShadow:`0 0 8px ${item.color}60` }} />
                      <div>
                        <div className="text-xs text-[#6B6858] font-mono">{item.time}</div>
                        <div className="text-sm text-[#F5F0E8] mt-0.5">{item.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Quick links — 2 col, always */}
          <div className="grid grid-cols-2 gap-3 mt-0">
            {[
              { label:'Manage Guest RSVP', icon:ICONS.users,   color:'#C9A84C', to:'/portal/rsvp'     },
              { label:'Leave Feedback',    icon:ICONS.kitchen, color:'#9B6DE8', to:'/portal/feedback' },
            ].map(({ label, icon, color, to }) => (
              <Link key={label} to={to}
                className="flex flex-col items-center gap-2.5 py-5 px-3 rounded-2xl no-underline transition-all duration-200 lg:hover:-translate-y-0.5 lg:hover:shadow-lg"
                style={{ background:'rgba(255,255,255,0.03)', border:`1px solid ${color}25` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background:`${color}15`, border:`1px solid ${color}30`, color }}>
                  <Icon d={icon} size={18} />
                </div>
                <span className="text-xs md:text-sm text-[#9D9880] text-center">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {showPaxModal && <PaxChangeModal contracted={event.contractedPax} onClose={() => setShowPaxModal(false)} onSubmit={() => { setPaxRequested(true); setShowPaxModal(false); }} />}
    </div>
  );
}
