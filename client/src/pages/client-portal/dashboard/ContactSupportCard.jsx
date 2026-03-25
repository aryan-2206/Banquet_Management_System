import React from 'react';

export default function ContactSupportCard({ manager, client }) {
  if (!manager && !client?.manager) return null;
  const actualManager = manager || client.manager;
  
  return (
    <div className="portal-card">
      <div className="portal-section-label">Your Team</div>

      {/* ── Manager card ── */}
      <div className="mb-4 p-5 rounded-3xl flex flex-col items-center relative overflow-hidden group" style={{ background:'linear-gradient(145deg,rgba(255,255,255,0.03),rgba(18,18,31,0.6))', border:'1px solid rgba(201,168,76,0.15)', boxShadow:'0 8px 32px rgba(0,0,0,0.2)' }}>
        
        {/* Animated Gold Pulse Avatar */}
        <div className="relative mb-5 mt-2">
          {/* Pulsing ring */}
          <div className="absolute inset-0 rounded-full animate-ping" style={{ background: `${actualManager.color}40`, animationDuration: '3s' }}></div>
          {/* Static outer ring */}
          <div className="absolute inset-0 rounded-full" style={{ border: `1px solid ${actualManager.color}50`, transform: 'scale(1.2)' }}></div>
          
          {/* Main Avatar */}
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center font-bold text-xl md:text-2xl relative z-10"
            style={{ background: `linear-gradient(135deg, ${actualManager.color}30, ${actualManager.color}10)`, border: `2px solid ${actualManager.color}`, color: actualManager.color, boxShadow:`0 0 20px ${actualManager.color}40` }}>
            {actualManager.initials}
          </div>
          
          {/* Online status dot */}
          <div className="absolute bottom-0 right-1 md:right-2 w-4 h-4 md:w-5 md:h-5 rounded-full z-20" style={{ background: '#5FBF8A', border: '3px solid #12121F', boxShadow: '0 0 8px rgba(95,191,138,0.6)' }}></div>
        </div>

        {/* Text Details */}
        <div className="text-center mb-5">
           <h3 className="font-serif text-xl md:text-2xl font-bold text-[#F5F0E8] mb-1">{actualManager.name}</h3>
           <p className="text-[10px] md:text-xs tracking-[0.2em] font-medium uppercase" style={{ color: '#C9A84C' }}>{actualManager.role}</p>
        </div>

        {/* Divider */}
        <div className="w-full h-px mb-5" style={{ background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)' }}></div>

        {/* Action Buttons */}
        <div className="w-full grid grid-cols-2 gap-3 pb-1">
          <a href={`https://wa.me/${actualManager.wa}`} target="_blank" rel="noreferrer"
            className="w-full flex justify-center items-center gap-2 py-3.5 rounded-2xl text-[13px] md:text-sm font-semibold transition-all duration-300 hover:-translate-y-1"
            style={{ background: 'linear-gradient(135deg, #25D366, #128C7E)', color: '#fff', textDecoration: 'none', boxShadow: '0 4px 15px rgba(37,211,102,0.3)' }}>
            <span className="text-base md:text-lg">💬</span> WhatsApp
          </a>
          <a href={`tel:${actualManager.phone}`}
            className="w-full flex justify-center items-center gap-2 py-3.5 rounded-2xl text-[13px] md:text-sm font-semibold transition-all duration-300 hover:-translate-y-1"
            style={{ background: 'linear-gradient(135deg, #E85E9A, #E85555)', color: '#fff', textDecoration: 'none', boxShadow: '0 4px 15px rgba(232,85,85,0.3)' }}>
            <span className="text-base md:text-lg">📞</span> Call
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
