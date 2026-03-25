import React from 'react';

export default function ContactSupportCard({ manager, client }) {
  if (!manager && !client?.manager) return null;
  const actualManager = manager || client.manager;
  
  return (
    <div className="portal-card">
      <div className="portal-section-label">Your Team</div>

      {/* ── Manager card ── */}
      <div
        className="flex items-center gap-4 mb-4 p-4 rounded-2xl"
        style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}
      >
        {/* Avatar */}
        <div
          className="w-12 h-12 md:w-14 md:h-14 rounded-full flex-shrink-0 flex items-center justify-center font-bold text-base md:text-lg"
          style={{
            background:`${actualManager.color}20`,
            border:`2px solid ${actualManager.color}40`,
            color:actualManager.color
          }}
        >
          {actualManager.initials}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="text-sm md:text-base font-medium text-[#F5F0E8]">
            {actualManager.name}
          </div>
          <div className="text-xs md:text-sm text-[#6B6858]">
            {actualManager.role}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 flex-shrink-0">
          <a
            href={`https://wa.me/${actualManager.wa}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 py-2 px-3 rounded-xl min-h-[44px] min-w-[44px] transition-all duration-200 hover:brightness-125"
            style={{
              background:'rgba(37,211,102,0.1)',
              border:'1px solid rgba(37,211,102,0.3)',
              color:'#25D366',
              textDecoration:'none'
            }}
          >
            <span className="text-lg leading-none">💬</span>
            <span className="hidden lg:inline text-sm font-medium">WhatsApp</span>
          </a>

          <a
            href={`tel:${actualManager.phone}`}
            className="flex items-center gap-2 py-2 px-3 rounded-xl min-h-[44px] min-w-[44px] transition-all duration-200 hover:brightness-125"
            style={{
              background:'rgba(91,143,232,0.1)',
              border:'1px solid rgba(91,143,232,0.3)',
              color:'#5B8FE8',
              textDecoration:'none'
            }}
          >
            <span className="text-lg leading-none">📞</span>
            <span className="hidden lg:inline text-sm font-medium">Call</span>
          </a>
        </div>
      </div>

      {/* ── Venue address ── */}
      {client?.venue && (
        <div
          className="p-4 rounded-xl mb-3"
          style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="text-xs text-[#6B6858] mb-2">Venue Address</div>
          <div className="text-sm md:text-base text-[#F5F0E8] leading-relaxed mb-3">
            {client.venue.address}
          </div>
          <a
            href={client.venue.mapsUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 text-sm font-medium transition-all duration-200 hover:brightness-125"
            style={{ color:'#5B8FE8', textDecoration:'none' }}
          >
            📍 View on Google Maps →
          </a>
        </div>
      )}

      {/* ── Emergency contact ── */}
      {client?.emergencyContact && (
        <div
          className="flex items-center justify-between px-4 py-3 rounded-xl"
          style={{ background:'rgba(232,85,85,0.06)', border:'1px solid rgba(232,85,85,0.2)' }}
        >
          <div>
            <div className="text-xs text-[#E85555] mb-0.5">
              Emergency Day-Of Contact
            </div>
            <div className="text-sm md:text-base text-[#F5F0E8]">
              {client.emergencyContact.name}
            </div>
          </div>

          <a
            href={`tel:${client.emergencyContact.phone}`}
            className="flex items-center gap-2 py-2.5 px-4 rounded-xl min-h-[44px] font-medium text-sm transition-all duration-200 hover:brightness-125"
            style={{
              background:'rgba(232,85,85,0.12)',
              border:'1px solid rgba(232,85,85,0.3)',
              color:'#E85555',
              textDecoration:'none'
            }}
          >
            📞 <span className="hidden md:inline">Call</span>
          </a>
        </div>
      )}
    </div>
  );
}
