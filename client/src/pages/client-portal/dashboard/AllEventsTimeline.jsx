import React, { useState } from 'react';
import { fmt, fmtDate, daysUntil, STATUS_CONFIG, EVENT_TYPE_EMOJI } from './mockData';

export default function AllEventsTimeline({ events }) {
  const [filter, setFilter] = useState('all');
  const [expanded, setExpanded] = useState({});
  const tabs = ['all','upcoming','completed','cancelled'];

  const filterFn = e => {
    if (filter === 'upcoming')  return ['confirmed','pending_payment'].includes(e.status);
    if (filter === 'completed') return e.status === 'completed';
    if (filter === 'cancelled') return e.status === 'cancelled';
    return true;
  };
  const filtered = events.filter(filterFn);

  return (
    <div className="portal-card">
      <div className="portal-section-label">All Events</div>

      {/* Filter tabs — horizontally scrollable on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-4 scrollbar-none" style={{ WebkitOverflowScrolling:'touch' }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setFilter(t)}
            className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium capitalize cursor-pointer transition-all duration-200 min-h-[36px] ${
              filter===t
                ? 'text-[#C9A84C] border-[rgba(201,168,76,0.4)] bg-[rgba(201,168,76,0.1)]'
                : 'text-[#6B6858] border-[rgba(201,168,76,0.1)] bg-transparent hover:text-[#9D9880]'
            }`}
            style={{ border:`1px solid ${filter===t ? 'rgba(201,168,76,0.4)' : 'rgba(201,168,76,0.1)'}` }}>
            {t}
          </button>
        ))}
      </div>

      {/* ── Event grid ──
          Mobile:  1 column
          Tablet:  2 column grid
          Desktop: 3 column grid
      ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-8 text-sm text-[#4A4840]">No {filter} events found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map(ev => {
            const st    = STATUS_CONFIG[ev.status] || STATUS_CONFIG.confirmed;
            const days  = daysUntil(ev.date);
            const muted = ev.status === 'completed' || ev.status === 'cancelled';
            const isExp = expanded[ev.id];

            return (
              <div key={ev.id}
                className={`rounded-2xl p-4 flex flex-col gap-2 transition-all duration-300 ${muted ? 'opacity-60' : 'lg:hover:-translate-y-0.5 lg:hover:shadow-lg'}`}
                style={{
                  background:'rgba(255,255,255,0.02)',
                  border:`1px solid ${muted ? 'rgba(255,255,255,0.05)' : 'rgba(201,168,76,0.1)'}`,
                }}>
                {/* Top row */}
                <div className="flex items-start gap-3">
                  <span className="text-2xl flex-shrink-0">{EVENT_TYPE_EMOJI[ev.type] || '🎉'}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-[#F5F0E8] truncate">{ev.name}</div>
                    <div className="text-xs text-[#6B6858] mt-0.5">{fmtDate(ev.date)}</div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 font-medium"
                    style={{ background:st.bg, color:st.color, border:`1px solid ${st.border}` }}>
                    {/* Mobile: short. Desktop: full */}
                    <span className="block md:hidden">{st.label.split(' ')[0]}</span>
                    <span className="hidden md:block">{st.label}</span>
                  </span>
                </div>
                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-[#6B6858]">
                  <span>{ev.pax.contracted} pax</span>
                  <span className="text-sm font-medium text-[#F5F0E8]">{fmt(ev.totalValue)}</span>
                  {days > 0 && !muted && <span className="text-[#9D9880]">{days}d</span>}
                </div>
                {/* Multi-session expander (when ev.sessions?.length > 0) */}
                {ev.sessions?.length > 0 && (
                  <button onClick={() => setExpanded(p => ({...p,[ev.id]:!p[ev.id]}))}
                    className="text-xs text-[#C9A84C] text-left py-1 cursor-pointer bg-none border-none">
                    {isExp ? '▲ Hide sessions' : `▼ ${ev.sessions.length} sessions`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Book another CTA */}
      <div className="flex justify-center mt-5">
        <button className="w-full md:w-auto py-3 px-8 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200 hover:brightness-110 active:scale-95"
          style={{ border:'1px solid rgba(201,168,76,0.25)', background:'rgba(201,168,76,0.06)', color:'#C9A84C' }}>
          ✦ Book Another Event
        </button>
      </div>
    </div>
  );
}
