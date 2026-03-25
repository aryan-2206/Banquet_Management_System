import React, { useState } from 'react';
import { fmt, fmtDate } from './mockData';

export default function PaymentSummaryWidget({ events }) {
  const [expanded, setExpanded] = useState(null);

  const totalOutstanding = events.reduce((s, e) => s + (e.totalValue - e.paid), 0);
  const nextDue = events
    .flatMap(e => (e.instalments || []).filter(i => i.status !== 'paid').map(i => ({ ...i, eventName: e.name })))
    .sort((a, b) => new Date(a.due) - new Date(b.due))[0];

  return (
    <div className="portal-card">
      <div className="portal-section-label">Payment Summary</div>

      {/* ── Responsive layout: stack on mobile, 2-col on tablet ── */}
      <div className="flex flex-col md:flex-row md:items-start md:gap-6">

        {/* Outstanding total — left on tablet */}
        <div className="flex-shrink-0 md:w-56 mb-4 md:mb-0">
          <div className="rounded-2xl p-4 md:p-5 text-center"
            style={{ background:'rgba(201,168,76,0.06)', border:'1px solid rgba(201,168,76,0.15)' }}>
            <div className="text-xs text-[#9D9880] mb-1">Total Outstanding</div>
            <div className={`font-serif text-2xl md:text-3xl lg:text-4xl font-bold ${totalOutstanding > 0 ? 'text-[#E8C455]' : 'text-[#5FBF8A]'}`}>
              {fmt(totalOutstanding)}
            </div>
            {nextDue && (
              <div className={`mt-2 text-xs font-medium ${new Date(nextDue.due) < new Date() ? 'text-[#E85555]' : 'text-[#E8C455]'}`}>
                Next: {fmt(nextDue.amount)} · {fmtDate(nextDue.due)}
                {new Date(nextDue.due) < new Date() && ' ⚠ OVERDUE'}
              </div>
            )}
            {totalOutstanding > 0 && (
              <button className="mt-3 w-full py-3 rounded-xl font-semibold text-sm cursor-pointer border-none transition-all duration-200 hover:brightness-110"
                style={{ background:'linear-gradient(135deg,#C9A84C,#8B6520)', color:'#080810' }}>
                Pay Now →
              </button>
            )}
          </div>
        </div>

        {/* Per-event progress bars — right column on tablet */}
        <div className="flex-1 space-y-4">
          {events.map(ev => {
            const pct = Math.round((ev.paid / ev.totalValue) * 100);
            const isExp = expanded === ev.id;
            return (
              <div key={ev.id} className="rounded-xl p-3 md:p-4"
                style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
                {/* Header clickable */}
                <button className="w-full text-left cursor-pointer bg-none border-none p-0"
                  onClick={() => setExpanded(isExp ? null : ev.id)}>
                  {/* ── Desktop: amounts inline on same row ── */}
                  <div className="flex flex-col lg:flex-row lg:items-center lg:gap-4">
                    <div className="flex justify-between lg:flex-1 mb-2 lg:mb-0">
                      <span className="text-sm font-medium text-[#F5F0E8] truncate max-w-[60%] lg:max-w-xs">{ev.name}</span>
                      <span className="text-xs text-[#9D9880] flex-shrink-0">{pct}% paid</span>
                    </div>
                    {/* Inline amounts on desktop */}
                    <div className="hidden lg:flex items-center gap-4 text-xs flex-shrink-0">
                      <span className="text-[#9D9880]">Paid: {fmt(ev.paid)}</span>
                      <span style={{ color: ev.paid < ev.totalValue ? '#E8C455' : '#5FBF8A' }}>Bal: {fmt(ev.totalValue - ev.paid)}</span>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 rounded-full overflow-hidden mt-1 lg:mt-0" style={{ background:'rgba(255,255,255,0.06)' }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width:`${pct}%`, background:`linear-gradient(90deg,${pct===100?'#5FBF8A':'#C9A84C'},${pct===100?'#3DA870':'#8B6520'})` }} />
                  </div>
                  {/* Mobile amounts */}
                  <div className="lg:hidden flex justify-between mt-1 text-xs">
                    <span className="text-[#6B6858]">Paid: {fmt(ev.paid)}</span>
                    <span style={{ color: ev.paid < ev.totalValue ? '#E8C455' : '#5FBF8A' }}>Bal: {fmt(ev.totalValue - ev.paid)}</span>
                  </div>
                </button>

                {/* Instalment accordion */}
                {isExp && (
                  <div className="mt-3 pl-3 border-l-2 border-[rgba(201,168,76,0.2)] space-y-2">
                    {ev.instalments.map((inst, i) => (
                      <div key={i} className="flex items-center justify-between py-1.5 text-xs border-b border-[rgba(255,255,255,0.04)] last:border-0">
                        <div>
                          <div className="text-[#F5F0E8]">{inst.label}</div>
                          {/* Timestamp hidden on mobile, shown on tablet+ */}
                          <div className="hidden md:block text-[#4A4840] mt-0.5">Due: {fmtDate(inst.due)}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-[#F5F0E8]">{fmt(inst.amount)}</span>
                          <span className="text-[9px] px-2 py-0.5 rounded-full font-medium"
                            style={{
                              background: inst.status==='paid'?'rgba(95,191,138,0.15)':inst.status==='overdue'?'rgba(232,85,85,0.15)':'rgba(232,197,85,0.15)',
                              color:      inst.status==='paid'?'#5FBF8A':inst.status==='overdue'?'#E85555':'#E8C455',
                              border:`1px solid ${inst.status==='paid'?'rgba(95,191,138,0.3)':inst.status==='overdue'?'rgba(232,85,85,0.3)':'rgba(232,197,85,0.3)'}`,
                            }}>
                            {inst.status==='paid'?'✓ Paid':inst.status==='overdue'?'Overdue':'Pending'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
