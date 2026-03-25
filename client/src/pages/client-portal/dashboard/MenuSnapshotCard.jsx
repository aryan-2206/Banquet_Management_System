import React, { useState } from 'react';

const TIER_COLOR = { Elite:'#C9A84C', Premium:'#5B8FE8', Standard:'#5FBF8A' };

export default function MenuSnapshotCard({ event }) {
  const [requested, setRequested] = useState(false);
  if (!event) return null;
  const locked = event.menuLocked;
  const color  = TIER_COLOR[event.menuTier] || '#C9A84C';

  return (
    <div className="portal-card">
      {/* ── Header row: always inline ── */}
      <div className="flex items-center justify-between mb-4">
        <div className="portal-section-label mb-0">Menu Snapshot</div>
        <span className="text-xs px-3 py-1 rounded-full font-semibold"
          style={{ background:`${color}15`, color, border:`1px solid ${color}30` }}>
          {event.menuTier} Package
        </span>
      </div>

      {/* ── Responsive layout: stack mobile → row tablet ── */}
      <div className="flex flex-col md:flex-row md:items-start md:gap-6">

        {/* Dishes + Add-ons — flex-1 */}
        <div className="flex-1 mb-4 md:mb-0">
          <div className="text-xs text-[#6B6858] mb-2 md:mb-3">Signature Dishes</div>
          <div className="flex flex-wrap gap-2 mb-4">
            {event.highlights.map(dish => (
              <span key={dish} className="text-xs md:text-sm px-3 py-1.5 rounded-full min-h-[32px] flex items-center"
                style={{ background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)', color:'#F5F0E8' }}>
                {dish}
              </span>
            ))}
          </div>

          {event.addOns?.length > 0 && (
            <>
              <div className="text-xs text-[#6B6858] mb-2">Add-Ons</div>
              <div className="flex flex-wrap gap-2">
                {event.addOns.map(a => (
                  <span key={a} className="text-xs md:text-sm px-3 py-1.5 rounded-full min-h-[32px] flex items-center"
                    style={{ background:`${color}10`, border:`1px solid ${color}25`, color }}>
                    {a}
                  </span>
                ))}
              </div>
            </>
          )}
        </div>

        {/* CTA — full width mobile, auto+right-aligned tablet */}
        <div className="md:flex-shrink-0 md:self-center">
          {locked ? (
            <div className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm text-[#9D9880]"
              style={{ background:'rgba(157,152,128,0.08)', border:'1px solid rgba(157,152,128,0.2)' }}>
              🔒 <span className="hidden md:inline">Menu changes locked 7 days before event.</span>
              <span className="md:hidden">Menu locked.</span>
            </div>
          ) : requested ? (
            <div className="text-center rounded-xl px-4 py-3 text-sm text-[#5FBF8A]"
              style={{ background:'rgba(95,191,138,0.1)', border:'1px solid rgba(95,191,138,0.3)' }}>
              ✓ Request sent!
            </div>
          ) : (
            <button onClick={() => setRequested(true)}
              className="w-full md:w-auto py-3 px-6 rounded-xl text-sm font-medium cursor-pointer transition-all duration-200 hover:brightness-110 min-h-[44px] whitespace-nowrap"
              style={{ border:`1px solid rgba(201,168,76,0.25)`, background:'rgba(201,168,76,0.06)', color:'#C9A84C' }}>
              Request Menu Change →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
