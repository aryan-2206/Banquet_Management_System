import React from 'react';

export default function VendorVisibilityPanel({ vendors }) {
  if (!vendors || vendors.length === 0) return null;

  return (
    <div className="portal-card">
      <div className="flex items-center justify-between mb-4">
        <div className="portal-section-label mb-0">Vendors Assigned</div>
        <span className="text-[10px] text-[#4A4840] px-3 py-1 rounded-full"
          style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)' }}>
          Read-Only
        </span>
      </div>

      {/* ── Responsive:
          Mobile → horizontal scroll row (touch-action: pan-x)
          Tablet → 2-col grid
          Desktop → 3-col grid
      ── */}

      {/* Mobile: horizontal scroll */}
      <div className="flex gap-3 overflow-x-auto pb-2 md:hidden" style={{ WebkitOverflowScrolling:'touch', touchAction:'pan-x' }}>
        {vendors.map(v => <VendorCard key={v.id} v={v} className="flex-shrink-0 w-40" />)}
      </div>

      {/* Tablet+: grid */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-3">
        {vendors.map(v => <VendorCard key={v.id} v={v} className="" />)}
      </div>

      <p className="mt-3 text-xs text-[#4A4840] leading-relaxed">
        For vendor changes, contact your Event Manager directly.
      </p>
    </div>
  );
}

function VendorCard({ v, className }) {
  const confirmed = v.status === 'confirmed';
  return (
    <div className={`p-3 md:p-4 rounded-xl transition-all duration-200 lg:hover:-translate-y-0.5 ${className}`}
      style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}>
      <div className="text-2xl mb-2">
        {v.service==='Decorator'?'🌸':v.service==='Photographer'?'📷':v.service==='DJ Agency'?'🎧':'🔧'}
      </div>
      <div className="text-sm font-medium text-[#F5F0E8] truncate mb-1">{v.name}</div>
      <div className="text-xs text-[#6B6858] mb-2">{v.service}</div>
      <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
        style={{
          background: confirmed ? 'rgba(95,191,138,0.12)' : 'rgba(232,197,85,0.12)',
          color:      confirmed ? '#5FBF8A'               : '#E8C455',
          border:`1px solid ${confirmed ? 'rgba(95,191,138,0.3)' : 'rgba(232,197,85,0.3)'}`,
        }}>
        {confirmed ? '✓ Confirmed' : 'Pending'}
      </span>
    </div>
  );
}
