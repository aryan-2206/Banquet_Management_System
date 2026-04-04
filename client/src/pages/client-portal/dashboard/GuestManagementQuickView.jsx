import React from 'react';
import { useNavigate } from 'react-router-dom';

const DIET_COLORS = { veg:'#5FBF8A', nonVeg:'#E85555', jain:'#C9A84C', halal:'#9B6DE8' };
const DIET_LABELS = { veg:'Vegetarian', nonVeg:'Non-Veg', jain:'Jain', halal:'Halal' };

/* CSS-only donut — no JS charting library needed, better mobile performance */
function CSSDonut({ data, total }) {
  let pct = 0;
  const segments = Object.entries(data).map(([key, val]) => {
    const p = total > 0 ? (val / total) * 100 : 0;
    const seg = { key, val, color: DIET_COLORS[key], start: pct, len: p };
    pct += p;
    return seg;
  });

  return (
    <svg viewBox="0 0 100 100" className="w-24 h-24 md:w-28 md:h-28 flex-shrink-0">
      <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="14" />
      {segments.map(s => {
        const circ = 2 * Math.PI * 38;
        const dashArr = `${(s.len / 100) * circ} ${circ}`;
        const offset = -((s.start / 100) * circ) + circ * 0.25;
        return (
          <circle key={s.key} cx="50" cy="50" r="38" fill="none"
            stroke={s.color} strokeWidth="14"
            strokeDasharray={dashArr} strokeDashoffset={offset}
            transform="rotate(-90 50 50)" />
        );
      })}
      <text x="50" y="46" textAnchor="middle" fill="#F5F0E8" fontSize="13" fontWeight="700" fontFamily="'Cormorant Garamond',serif">{total}</text>
      <text x="50" y="58" textAnchor="middle" fill="#6B6858" fontSize="7">guests</text>
    </svg>
  );
}

export default function GuestManagementQuickView({ summary, compact, eventId }) {
  const navigate = useNavigate();
  const { total, confirmed, withoutQR, dietary } = summary;

  return (
    <div className="portal-card flex flex-col h-full">
      <div className="portal-section-label">Guest Overview</div>

      {/* ── Responsive: stat numbers stacked mobile → side by side tablet ── */}
      <div className={`flex flex-col ${compact ? 'flex-1' : 'md:flex-row md:items-center md:gap-6 lg:gap-8'} mb-4`}>

        {/* Stats (left column on tablet) */}
        <div className="flex-1">
          {/* Pax numbers — 2 col grid */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {[
              { label:'Total Invited',  val:total,     color:'#F5F0E8'  },
              { label:'Confirmed',      val:confirmed,  color:'#5FBF8A'  },
            ].map(({ label, val, color }) => (
              <div key={label} className="text-center rounded-xl py-3"
                style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                <div className="font-serif text-2xl md:text-3xl font-bold" style={{ color }}>{val}</div>
                <div className="text-xs text-[#6B6858] mt-1">{label}</div>
              </div>
            ))}
          </div>

          {/* Dietary legend */}
          <div className="space-y-2">
            {Object.entries(dietary).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background:DIET_COLORS[k] }} />
                  <span className="text-xs md:text-sm text-[#9D9880]">{DIET_LABELS[k]}</span>
                </div>
                <span className="text-xs md:text-sm font-medium text-[#F5F0E8]">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Donut chart — right column on tablet, full width below on mobile */}
        <div className={`flex justify-center mt-4 ${compact ? '' : 'md:mt-0 md:flex-shrink-0'}`}>
          <CSSDonut data={dietary} total={total} />
        </div>
      </div>

      {/* QR nudge */}
      {withoutQR > 0 && (
        <div className="flex items-center justify-between rounded-xl px-4 py-3 mb-3"
          style={{ background:'rgba(232,197,85,0.08)', border:'1px solid rgba(232,197,85,0.25)' }}>
          <span className="text-sm text-[#E8C455]">⚡ {withoutQR} guests without QR</span>
          <button onClick={() => navigate(eventId ? `/client/rsvp/${eventId}` : '/client/rsvp')}
            className="py-2 px-4 rounded-lg text-xs font-medium cursor-pointer min-h-[36px]"
            style={{ background:'rgba(232,197,85,0.15)', border:'1px solid rgba(232,197,85,0.3)', color:'#E8C455' }}>
            Send QR
          </button>
        </div>
      )}

      {/* CTA */}
      <button onClick={() => navigate(eventId ? `/client/rsvp/${eventId}` : '/client/rsvp')}
        className="w-full md:w-auto py-3 px-6 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200 hover:brightness-110 block md:mx-auto"
        style={{ border:'1px solid rgba(155,109,232,0.3)', background:'rgba(155,109,232,0.07)', color:'#9B6DE8' }}>
        Manage Full Guest List →
      </button>
    </div>
  );
}
