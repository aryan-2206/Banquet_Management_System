import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import api from '../../utils/api';
import { CLIENT, fmt, fmtDate, daysUntil, EVENT_TYPE_EMOJI, STATUS_CONFIG } from './dashboard/mockData';
import GuestManagementQuickView from './dashboard/GuestManagementQuickView';
import '../client-portal/ClientPortal.css';

// ─── Icon helper ───────────────────────────────────────────────────────────
const Icon = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const BACK = 'M19 12H5M12 5l-7 7 7 7';
const PIN  = 'M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z';
const CAL  = 'M3 4h18v18H3zm5-2v4M16 2v4M3 10h18';
const USR  = 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8z';
const FOOD = 'M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z';
const CART = 'M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0';
const VEND = 'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z';
const PHOTO= 'M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z';

const API_BASE = 'http://localhost:5001';

// Fallback placeholder photos shown when the DB gallery is empty
const PLACEHOLDER_GALLERY = [
  { id: 'p1', url: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80', caption: 'Wedding Reception Setup' },
  { id: 'p2', url: 'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?w=600&q=80', caption: 'Floral Décor' },
  { id: 'p3', url: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=600&q=80', caption: 'Grand Entrance' },
  { id: 'p4', url: 'https://images.unsplash.com/photo-1485872299829-c673f5194813?w=600&q=80', caption: 'Banquet Table Arrangement' },
  { id: 'p5', url: 'https://images.unsplash.com/photo-1592861956120-e524fc739696?w=600&q=80', caption: 'Dessert Station' },
  { id: 'p6', url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&q=80', caption: 'Cake Cutting' },
];

// ─── Sub-components ─────────────────────────────────────────────────────────
function SectionTitle({ icon, children }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span style={{ color: '#C9A84C' }}><Icon d={icon} size={16} /></span>
      <span className="portal-section-label" style={{ marginBottom: 0 }}>{children}</span>
    </div>
  );
}

function StatBadge({ label, value, color }) {
  return (
    <div className="text-center rounded-2xl py-4 px-3" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="font-serif text-2xl font-bold mb-1" style={{ color }}>{value}</div>
      <div className="text-[10px] text-[#6B6858] uppercase tracking-wider">{label}</div>
    </div>
  );
}

function GalleryModal({ photo, onClose, onPrev, onNext }) {
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.92)' }} onClick={onClose}>
      <button onClick={(e) => { e.stopPropagation(); onPrev(); }}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={{ background: 'rgba(201,168,76,0.2)', border: '1px solid rgba(201,168,76,0.4)', color: '#C9A84C' }}>
        <Icon d="M15 18l-6-6 6-6" size={20} />
      </button>
      <div className="max-w-4xl w-full" onClick={e => e.stopPropagation()}>
        <img src={photo.url} alt={photo.caption} className="w-full rounded-2xl object-cover max-h-[70vh]" style={{ border: '1px solid rgba(201,168,76,0.2)' }} />
        <p className="text-center text-[#9D9880] text-sm mt-3">{photo.caption}</p>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onNext(); }}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110"
        style={{ background: 'rgba(201,168,76,0.2)', border: '1px solid rgba(201,168,76,0.4)', color: '#C9A84C' }}>
        <Icon d="M9 18l6-6-6-6" size={20} />
      </button>
      <button onClick={onClose} className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center"
        style={{ background: 'rgba(255,255,255,0.1)', color: '#F5F0E8' }}>✕</button>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function EventDetail() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const [event, setEvent] = useState(location.state?.event || null);
  const [loading, setLoading] = useState(!event);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!event && id) {
      api.getBooking(id).then(res => {
        if (res.success && res.booking) {
          const b = res.booking;
          setEvent({
            id: b._id,
            type: b.eventDetails?.eventType || 'wedding',
            name: b.personalDetails?.name + ' Event',
            date: b.eventDetails?.date ? new Date(b.eventDetails.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
            time: b.eventDetails?.time || '18:00',
            hall: b.eventDetails?.venue ? b.eventDetails.venue.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : 'Grand Hall',
            pax: { contracted: b.eventDetails?.guests || 100, confirmed: b.eventDetails?.guests || 100 },
            menuTier: b.menuSelection?.customRequirements?.includes('Elite') ? 'Elite' : 'Premium',
            status: b.status || 'confirmed',
            totalValue: b.costEstimate?.totalCost || 0,
            paid: (b.payments || []).reduce((sum, p) => sum + (p.amount || 0), 0),
            instalments: b.payments || [],
            highlights: ['Welcome Drink', 'Main Course', 'Desserts'],
            addOns: [],
            menuLocked: false,
            sessions: [],
            vendors: []
          });
        }
        setLoading(false);
      }).catch(err => {
        console.error("Failed to fetch event", err);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [id, event]);

  const [guestSummary, setGuestSummary] = useState(null);

  useEffect(() => {
    if (event?.id) {
      fetch(`${API_BASE}/api/guests?bookingId=${event.id}&eventId=${event.id}`)
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            const list = data.guests;
            const total = list.length;
            const confirmed = list.filter(g => g.rsvp === 'confirmed').length;
            const pending = list.filter(g => g.rsvp === 'pending').length;
            const withoutQR = list.filter(g => g.rsvp === 'confirmed').length; // Simplification
            const dietary = { veg:0, nonVeg:0, jain:0, halal:0 };
            list.forEach(g => {
              if (g.dietary?.includes('veg')) dietary.veg++;
              if (g.dietary?.includes('nonVeg') || g.dietary?.includes('non-veg')) dietary.nonVeg++;
              if (g.dietary?.includes('jain')) dietary.jain++;
              if (g.dietary?.includes('halal')) dietary.halal++;
            });
            setGuestSummary({ total, confirmed, pending, withoutQR, dietary });
          }
        })
        .catch(() => {});
    }
  }, [event?.id]);

  // ── Fetch real payment record to compute Balance Due ────────────────
  const [paymentRecord, setPaymentRecord] = useState(null);
  useEffect(() => {
    if (event?.id) {
      api.getPaymentByBooking(event.id)
        .then(data => {
          const records = data.payments || data;
          const record = Array.isArray(records) ? records.find(p => p.booking === event.id || p.booking?._id === event.id || p.booking?.toString() === event.id) || records[0] : records;
          if (record) setPaymentRecord(record);
        })
        .catch(() => {});
    }
  }, [event?.id]);

  // ── Fetch gallery from backend ──────────────────────────────
  const [gallery, setGallery] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(null);

  const fetchGallery = useCallback(async () => {
    if (!event?.id) return;
    setGalleryLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/events/${event.id}/gallery`);
      const data = await res.json();
      setGallery(data.photos && data.photos.length > 0 ? data.photos : PLACEHOLDER_GALLERY);
    } catch {
      setGallery(PLACEHOLDER_GALLERY); // network error → show placeholders
    } finally {
      setGalleryLoading(false);
    }
  }, [event?.id]);

  useEffect(() => { fetchGallery(); }, [fetchGallery]);

  if (loading) return (
    <div className="portal-page flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-[#C9A84C] text-sm animate-pulse">Loading Event Details...</div>
      </div>
    </div>
  );

  if (!event) return (
    <div className="portal-page flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="text-5xl mb-4">📭</div>
        <p className="text-[#6B6858]">No event found.</p>
        <button onClick={() => navigate('/client')} className="mt-4 text-[#C9A84C] underline">Back to Dashboard</button>
      </div>
    </div>
  );

  const totalValue = paymentRecord?.totalValue || event.totalValue;
  const paid       = paymentRecord?.totalPaid  ?? paymentRecord?.payments?.reduce((s,p) => s + (p.amount||0), 0) ?? event.paid;
  const balance    = totalValue - paid;
  const status     = STATUS_CONFIG[event.status] || STATUS_CONFIG.confirmed;
  const days = daysUntil(event.date);
  const TABS = ['overview', 'menu', 'vendors', 'gallery'];

  return (
    <div className="portal-page min-h-screen" style={{ fontFamily: "'Outfit', 'DM Sans', sans-serif" }}>
      {/* ── Sticky header ── */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-4 py-3"
        style={{ background: 'rgba(8,8,16,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(201,168,76,0.1)' }}>
        <button onClick={() => navigate('/client')} className="flex items-center gap-2 text-sm font-medium transition-all hover:text-[#C9A84C]" style={{ color: '#9D9880' }}>
          <Icon d={BACK} size={16} /> Dashboard
        </button>
        <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: '#C9A84C' }}>Event Details</span>
        <span className="text-[10px] font-semibold px-3 py-1 rounded-full" style={{ background: status.bg, color: status.color, border: `1px solid ${status.border}` }}>
          {status.label}
        </span>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* ── Hero Banner ── */}
        <div className="rounded-3xl mb-6 overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg, rgba(201,168,76,0.14), rgba(18,18,31,0.95))', border: '1px solid rgba(201,168,76,0.2)' }}>
          <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, #C9A84C 0%, transparent 60%)' }} />
          <div className="p-6 md:p-8 relative">
            <div className="flex flex-col md:flex-row md:items-center gap-5">
              <div className="text-6xl md:text-7xl flex-shrink-0 text-center md:text-left">
                {EVENT_TYPE_EMOJI[event.type] || '🎉'}
              </div>
              <div className="flex-1">
                <h1 className="font-serif text-2xl md:text-3xl font-bold text-[#F5F0E8] leading-tight mb-2">{event.name}</h1>
                <div className="flex flex-wrap gap-4 text-sm text-[#9D9880] mb-3">
                  <span className="flex items-center gap-1.5"><Icon d={CAL} size={13} /> {fmtDate(event.date)} · {event.time.replace(':', 'h ')}</span>
                  <span className="flex items-center gap-1.5"><Icon d={PIN} size={13} /> {event.hall}</span>
                  <span className="flex items-center gap-1.5"><Icon d={USR} size={13} /> {event.pax.contracted} guests contracted</span>
                </div>
                <span className="inline-block text-xs font-bold px-3 py-1 rounded-full"
                  style={{ background: days <= 1 ? 'rgba(232,85,85,0.15)' : days <= 7 ? 'rgba(232,197,85,0.15)' : 'rgba(95,191,138,0.15)', color: days <= 1 ? '#E85555' : days <= 7 ? '#E8C455' : '#5FBF8A' }}>
                  {days > 0 ? `${days} days to go` : days === 0 ? '🎊 Today!' : 'Completed'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stats Row ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatBadge label="Contracted Pax"  value={event.pax.contracted} color="#C9A84C" />
          <StatBadge label="Confirmed Guests" value={guestSummary ? guestSummary.total : '—'}  color="#9B6DE8" />
          <StatBadge label="Total Value"      value={fmt(totalValue)} color="#5FBF8A" />
          <StatBadge label="Balance Due"      value={fmt(balance)} color={balance > 0 ? '#E8C455' : '#5FBF8A'} />
        </div>

        {/* ── Payment Progress ── */}
        <div className="portal-card mb-6">
          <SectionTitle icon={CART}>Payment Progress</SectionTitle>
          <div className="flex justify-between text-xs text-[#9D9880] mb-2">
            <span>Paid: {fmt(paid)}</span>
            <span>{Math.round((paid / (totalValue || 1)) * 100)}% complete</span>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden mb-4" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(Math.round((paid/(totalValue||1))*100), 100)}%`, background: 'linear-gradient(90deg, #C9A84C, #5FBF8A)' }} />
          </div>
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
            {event.instalments.map((inst, i) => (
              <div key={i} className="flex items-center justify-between py-3 text-sm">
                <div>
                  <div className="text-[#F5F0E8] font-medium">{inst.label}</div>
                  <div className="text-xs text-[#6B6858]">Due: {fmtDate(inst.due)}</div>
                </div>
                <div className="text-right">
                  <div className="font-semibold" style={{ color: inst.status === 'paid' ? '#5FBF8A' : inst.status === 'overdue' ? '#E85555' : '#E8C455' }}>{fmt(inst.amount)}</div>
                  <div className="text-[10px] mt-0.5 capitalize px-2 py-0.5 rounded-full"
                    style={{ background: inst.status === 'paid' ? 'rgba(95,191,138,0.1)' : inst.status === 'overdue' ? 'rgba(232,85,85,0.1)' : 'rgba(232,197,85,0.1)', color: inst.status === 'paid' ? '#5FBF8A' : inst.status === 'overdue' ? '#E85555' : '#E8C455' }}>
                    {inst.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Tab Nav ── */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {TABS.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className="px-5 py-2 rounded-xl text-sm font-medium capitalize whitespace-nowrap transition-all duration-200 border-none cursor-pointer"
              style={activeTab === tab
                ? { background: 'linear-gradient(135deg,#C9A84C,#8B6520)', color: '#080810' }
                : { background: 'rgba(255,255,255,0.04)', color: '#6B6858', border: '1px solid rgba(255,255,255,0.08)' }}>
              {tab}
            </button>
          ))}
        </div>

        {/* ── Overview Tab ── */}
        {activeTab === 'overview' && (
          <div className="portal-card animate-fade-in">
            <SectionTitle icon={CAL}>Event Overview</SectionTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                ['Event Type', event.type.charAt(0).toUpperCase() + event.type.slice(1)],
                ['Hall / Venue', event.hall],
                ['Date', fmtDate(event.date)],
                ['Time', event.time.replace(':', 'h ')],
                ['Menu Tier', event.menuTier],
                ['Menu Status', event.menuLocked ? '🔒 Locked' : '✏️ Editable'],
                ['Manager', CLIENT.manager.name],
                ['Account ID', CLIENT.accountId],
              ].map(([label, val]) => (
                <div key={label} className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div className="text-[10px] text-[#6B6858] uppercase tracking-wider mb-1">{label}</div>
                  <div className="text-sm font-medium text-[#F5F0E8]">{val}</div>
                </div>
              ))}
            </div>
            {event.addOns?.length > 0 && (
              <div className="mt-4">
                <div className="text-[10px] text-[#6B6858] uppercase tracking-wider mb-2">Add-ons</div>
                <div className="flex flex-wrap gap-2">
                  {event.addOns.map(a => (
                    <span key={a} className="text-xs px-3 py-1.5 rounded-full" style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.2)' }}>{a}</span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="mt-4">
              {guestSummary ? (
                <GuestManagementQuickView summary={guestSummary} compact={true} eventId={event.id} />
              ) : (
                <div className="text-xs text-[#6B6858] p-4 text-center portal-card">Loading guest statistics...</div>
              )}
            </div>
          </div>
        )}

        {/* ── Menu Tab ── */}
        {activeTab === 'menu' && (
          <div className="portal-card animate-fade-in">
            <SectionTitle icon={FOOD}>Menu Highlights</SectionTitle>
            <div className="mb-3 flex items-center gap-2">
              <span className="text-xs px-3 py-1 rounded-full font-semibold" style={{ background: 'rgba(201,168,76,0.12)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.25)' }}>
                {event.menuTier} Tier
              </span>
              {event.menuLocked && <span className="text-xs text-[#E85555]">🔒 Finalized</span>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {event.highlights.map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span className="text-lg">🍽️</span>
                  <span className="text-sm text-[#F5F0E8]">{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Vendors Tab ── */}
        {activeTab === 'vendors' && (
          <div className="portal-card animate-fade-in">
            <SectionTitle icon={VEND}>Vendor Team</SectionTitle>
            {event.vendors?.length > 0 ? (
              <div className="space-y-3">
                {event.vendors.map(v => (
                  <div key={v.id} className="flex items-center justify-between p-4 rounded-2xl"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div>
                      <div className="text-sm font-semibold text-[#F5F0E8]">{v.name}</div>
                      <div className="text-xs text-[#6B6858] mt-0.5">{v.service}</div>
                    </div>
                    <span className="text-[10px] font-bold px-3 py-1.5 rounded-full capitalize"
                      style={{ background: v.status === 'confirmed' ? 'rgba(95,191,138,0.12)' : 'rgba(232,197,85,0.12)', color: v.status === 'confirmed' ? '#5FBF8A' : '#E8C455', border: `1px solid ${v.status === 'confirmed' ? 'rgba(95,191,138,0.3)' : 'rgba(232,197,85,0.3)'}` }}>
                      {v.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#4A4840] text-center py-6">No vendors assigned yet.</p>
            )}
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="animate-fade-in">
            <div className="portal-card">
              <SectionTitle icon={PHOTO}>Event Gallery</SectionTitle>
              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-[#6B6858]">Click any photo to view fullscreen.</p>
                {/* Upload button */}
                <label className="cursor-pointer flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all hover:brightness-110"
                  style={{ background: 'rgba(201,168,76,0.12)', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.25)' }}>
                  📤 Upload Photos
                  <input type="file" accept="image/*" multiple className="hidden"
                    onChange={async (e) => {
                      const files = Array.from(e.target.files);
                      if (!files.length) return;
                      setUploadProgress('Uploading...');
                      const form = new FormData();
                      files.forEach(f => form.append('photos', f));
                      try {
                        const res = await fetch(`${API_BASE}/api/events/${event.id}/gallery/upload`, { method: 'POST', body: form });
                        const data = await res.json();
                        if (data.success) { await fetchGallery(); setUploadProgress(null); }
                        else setUploadProgress('Upload failed');
                      } catch { setUploadProgress('Upload failed'); }
                    }}
                  />
                </label>
              </div>
              {uploadProgress && <p className="text-xs text-center py-2" style={{ color: '#C9A84C' }}>{uploadProgress}</p>}
              {galleryLoading ? (
                <div className="text-center py-12 text-[#6B6858] text-sm">Loading gallery…</div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {gallery.map((photo, i) => (
                    <div key={photo.id} className="relative rounded-2xl overflow-hidden cursor-pointer group"
                      style={{ aspectRatio: '4/3', border: '1px solid rgba(201,168,76,0.1)' }}
                      onClick={() => setLightboxIndex(i)}>
                      <img src={photo.url} alt={photo.caption}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3"
                        style={{ background: 'linear-gradient(transparent, rgba(8,8,16,0.85))' }}>
                        <span className="text-xs text-[#F5F0E8]">{photo.caption}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {lightboxIndex !== null && (
          <GalleryModal
            photo={gallery[lightboxIndex]}
            onClose={() => setLightboxIndex(null)}
            onPrev={() => setLightboxIndex((lightboxIndex - 1 + gallery.length) % gallery.length)}
            onNext={() => setLightboxIndex((lightboxIndex + 1) % gallery.length)}
          />
        )}
      </div>
    </div>
  );
}
