import React from 'react';
import { useNavigate } from 'react-router-dom';
import { fmt, fmtDate, daysUntil, EVENT_TYPE_EMOJI } from './mockData';

const ARROW = 'M5 12h14M12 5l7 7-7 7';
const WARN  = 'M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01';
const Icon = ({ d, size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={d}/></svg>
);

export default function UpcomingEventCard({ event }) {
  const navigate = useNavigate();
  if (!event) return (
    <div className="portal-card text-center py-10">
      <div className="text-4xl mb-3">📅</div>
      <p className="text-sm text-[#4A4840]">No upcoming events. Book your first event!</p>
    </div>
  );

  const days    = daysUntil(event.date);
  const balance = event.totalValue - event.paid;
  const overdue = event.instalments?.some(i => i.status === 'overdue');
  const pillLabel = days === 0 ? '🎊 Today!' : days === 1 ? '🔥 Tomorrow!' : days > 0 ? `In ${days} days` : 'Completed';
  const pillColor = days <= 1 ? '#E85555' : days <= 7 ? '#E8C455' : '#5FBF8A';

  return (
    <div className="portal-card mb-4 transition-all duration-300 lg:hover:-translate-y-0.5 lg:hover:shadow-xl">
      <div className="portal-section-label">Next Event</div>

      {/* ── Event banner: stacked mobile → side-by-side tablet ── */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-4 p-4 md:p-5 rounded-2xl relative overflow-hidden"
        style={{ background:'linear-gradient(135deg,rgba(201,168,76,0.12),rgba(18,18,31,0.8))', border:'1px solid rgba(201,168,76,0.15)' }}>

        {/* Emoji — larger on mobile (full width top), smaller on tablet (left column 40%) */}
        <div className="text-center md:text-left md:w-[40%] md:flex-shrink-0">
          <div className="text-5xl md:text-6xl">{EVENT_TYPE_EMOJI[event.type] || '🎉'}</div>
        </div>

        {/* Details — right 60% on tablet */}
        <div className="flex-1 text-center md:text-left">
          <div className="absolute top-2 right-2">
            <span className="text-[10px] font-semibold px-3 py-1 rounded-full"
              style={{ background:`${pillColor}20`, color:pillColor, border:`1px solid ${pillColor}40` }}>
              {pillLabel}
            </span>
          </div>
          <h2 className="font-serif text-lg md:text-xl lg:text-2xl font-bold text-[#F5F0E8] leading-tight mb-1">{event.name}</h2>
          <div className="text-sm text-[#9D9880]">{event.hall}</div>
          <div className="text-xs text-[#6B6858] mt-1">{fmtDate(event.date)} · {event.time.replace(':','h ')}</div>
        </div>
      </div>

      {/* Stats row: always 3-col */}
      <div className="grid grid-cols-3 gap-2 md:gap-3 mb-3">
        {[
          { label:'Confirmed Pax', val: event.pax.confirmed,    color:'#9B6DE8' },
          { label:'Menu Tier',     val: event.menuTier,          color:'#C9A84C' },
          { label:'Balance Due',   val: fmt(balance),            color: balance > 0 ? '#E8C455' : '#5FBF8A' },
        ].map(({ label, val, color }) => (
          <div key={label} className="text-center rounded-xl py-3 px-2"
            style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
            <div className="font-serif text-lg md:text-xl lg:text-2xl font-bold" style={{ color }}>{val}</div>
            <div className="text-[9px] md:text-xs text-[#6B6858] mt-1">{label}</div>
          </div>
        ))}
      </div>

      {overdue && (
        <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-[#E85555] mb-3"
          style={{ background:'rgba(232,85,85,0.08)', border:'1px solid rgba(232,85,85,0.25)' }}>
          <Icon d={WARN} size={13} /> Payment overdue — clear before event date.
        </div>
      )}

      {/* CTA: full width mobile, auto width md+ centered */}
      <div className="flex justify-center">
        <button onClick={() => navigate('/client/summary')}
          className="w-full md:w-auto py-3 px-8 rounded-xl font-semibold text-sm cursor-pointer flex items-center justify-center gap-2 transition-all duration-200 hover:brightness-110 active:scale-95 border-none"
          style={{ background:'linear-gradient(135deg,#C9A84C,#8B6520)', color:'#080810' }}>
          View Full Details <Icon d={ARROW} size={16} />
        </button>
      </div>
    </div>
  );
}
