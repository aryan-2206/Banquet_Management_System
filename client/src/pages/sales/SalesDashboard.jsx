import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import useBookingStore from '../../store/bookingSlice';
import './SalesDashboard.css';

/* ─── Component ───────────────────────────────────────────── */
export default function SalesDashboard() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('dashboard');
  const [search, setSearch] = useState('');
  const [liveAlert, setLiveAlert] = useState(null); // { msg, type }

  const { bookings, fetchBookings, loading } = useBookingStore();

  // ── Initial fetch
  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // ── Real-time Socket.io listeners
  useEffect(() => {
    const SOCKET_URL = (import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001');
    const socket = io(SOCKET_URL, { transports: ['websocket'] });

    socket.on('booking:statusChanged', (data) => {
      console.log('📡 [Sales] booking:statusChanged', data);
      // Update the local bookings list optimistically
      useBookingStore.setState(s => ({
        bookings: s.bookings.map(b =>
          b._id === data.bookingId || b.enquiryId === data.enquiryId
            ? { ...b, status: data.newStatus }
            : b
        )
      }));
      // Show live alert
      const statusLabels = { confirmed: '✅ Confirmed', completed: '🎉 Fully Paid', deposit: '💰 Advance Paid' };
      setLiveAlert({
        msg: `${data.clientName || data.enquiryId} — ${statusLabels[data.newStatus] || data.newStatus} (${data.tranchePaid || ''})`,
        type: data.newStatus === 'completed' ? 'success' : 'info',
      });
      setTimeout(() => setLiveAlert(null), 6000);
      // Full refresh after 3s to get complete data
      setTimeout(() => fetchBookings(), 3000);
    });

    socket.on('qr:batch_sent', (data) => {
      console.log('📡 [Sales] qr:batch_sent', data);
      setLiveAlert({
        msg: `🎟 ${data.guestCount} QR entry passes sent for ${data.eventName || data.enquiryId}`,
        type: 'success',
      });
      setTimeout(() => setLiveAlert(null), 8000);
    });

    return () => socket.disconnect();
  }, [fetchBookings]);

  // Derived Statistics from Live DB
  const stats = useMemo(() => {
    const active = bookings.filter(b => b.status === 'confirmed').length;
    const pending = bookings.filter(b => b.status === 'enquiry').length;
    const nonCancelled = bookings.filter(b => b.status !== 'cancelled');

    const revenue = nonCancelled.reduce((acc, b) => acc + (b.total || 0), 0);
    const avgPax = nonCancelled.length
      ? Math.round(nonCancelled.reduce((acc, b) => acc + (b.pax || 0), 0) / nonCancelled.length)
      : 0;

    const fmtRev = revenue >= 100000 ? `₹${(revenue / 100000).toFixed(2)}L` : `₹${revenue.toLocaleString('en-IN')}`;

    return [
      { label: 'Active Bookings', value: active.toString(), trend: '' },
      { label: 'Revenue Pipeline', value: fmtRev, trend: 'All non-cancelled' },
      { label: 'Pending Enquiries', value: pending.toString(), trend: 'Requires follow-up' },
      { label: 'Avg Pax / Event', value: avgPax.toString(), trend: '' },
    ];
  }, [bookings]);

  // Funnel Stages
  const pipeline = useMemo(() => {
    const counts = { enquiry: 0, temporary: 0, confirmed: 0 };
    const values = { enquiry: 0, temporary: 0, confirmed: 0 };

    bookings.forEach(b => {
      if (counts[b.status] !== undefined) {
        counts[b.status]++;
        values[b.status] += (b.total || 0);
      }
    });

    const total = Object.values(counts).reduce((a, b) => a + b, 0) || 1;
    const fmt = (v) => v >= 100000 ? `₹${(v / 100000).toFixed(2)}L` : `₹${v.toLocaleString('en-IN')}`;

    return [
      { stage: 'New Enquiry', count: counts.enquiry, value: fmt(values.enquiry), color: '#5B8FE8', pct: (counts.enquiry / total) * 100 },
      { stage: 'Temporary', count: counts.temporary, value: fmt(values.temporary), color: '#9B6DE8', pct: (counts.temporary / total) * 100 },
      { stage: 'Confirmed', count: counts.confirmed, value: fmt(values.confirmed), color: '#5FBF8A', pct: (counts.confirmed / total) * 100 },
    ];
  }, [bookings]);

  // Upcoming Schedule
  const schedule = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    return bookings
      .filter(b => b.date && new Date(b.date) >= startOfToday && b.status !== 'cancelled')
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 4)
      .map(b => ({
        time: b.startTime || 'TBD',
        label: `${b.partyName} - ${b.venue}`,
        tag: b.status,
        date: new Date(b.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
      }));
  }, [bookings]);

  const STATUS_BADGE = {
    confirmed:       'sd-badge--green',
    completed:       'sd-badge--green',
    enquiry:         'sd-badge--amber',
    temporary:       'sd-badge--purple',
    'pending-payment': 'sd-badge--purple',
    cancelled:       'sd-badge--red',
    deposit:         'sd-badge--blue',
  };

  const filtered = bookings.filter(b => {
    const s = search.toLowerCase();
    return (
      (b.partyName || '').toLowerCase().includes(s) ||
      (b.clientName || '').toLowerCase().includes(s) ||
      (b.enquiryId || '').toLowerCase().includes(s) ||
      (b.venue || '').toLowerCase().includes(s)
    );
  }).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

  return (
    <div className="sd-root">
      {/* ── Live Alert Toast ── */}
      {liveAlert && (
        <div style={{
          position: 'fixed', top: 80, right: 24, zIndex: 9999,
          background: liveAlert.type === 'success' ? 'rgba(95,191,138,0.15)' : 'rgba(91,143,232,0.15)',
          border: `1px solid ${liveAlert.type === 'success' ? '#5FBF8A' : '#5B8FE8'}`,
          borderRadius: 12, padding: '12px 20px', color: '#F5F0E8',
          fontSize: 13, fontWeight: 500, maxWidth: 340,
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          animation: 'fadeIn 0.3s ease',
        }}>
          <div style={{ color: liveAlert.type === 'success' ? '#5FBF8A' : '#5B8FE8', fontSize: 11, marginBottom: 4, letterSpacing: '0.1em', textTransform: 'uppercase' }}>⚡ Live Update</div>
          {liveAlert.msg}
        </div>
      )}

      {/* ── Topbar ── */}
      <div className="sd-topbar">
        <div className="sd-topbar__brand">
          <div className="sd-topbar__logo">S</div>
          <div>
            <div className="sd-topbar__title">Sales Dashboard</div>
            <div className="sd-topbar__sub">Banquet IntelliManager</div>
          </div>
        </div>
        <button className="sd-topbar__backbtn" onClick={() => navigate('/')}>
          ← Back to Home
        </button>
      </div>

      <div className="sd-body">
        {/* ── Left nav ── */}
        <nav className="sd-sidenav">
          {[
            { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
            { id: 'bookings', icon: '📋', label: 'Bookings' },
            { id: 'analytics', icon: '📊', label: 'Analytics' },
            { id: 'clients', icon: '👥', label: 'Clients' },
          ].map(item => (
            <div
              key={item.id}
              className={`sd-navitem ${activeNav === item.id ? 'sd-navitem--active' : ''}`}
              onClick={() => setActiveNav(item.id)}
            >
              <span className="sd-navitem__icon">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>

        {/* ── Main content ── */}
        <main className="sd-main">
          {/* Hero strip */}
          <div className="sd-hero">
            <div>
              <div className="sd-hero__kicker">Sales Overview</div>
              <div className="sd-hero__headline">Welcome, Sales Manager</div>
              <div className="sd-hero__meta">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="sd-stats">
            {stats.map(s => (
              <div key={s.label} className="sd-stat">
                <div className="sd-stat__val">{loading ? '...' : s.value}</div>
                <div className="sd-stat__label">{s.label}</div>
                <div className="sd-stat__trend">{s.trend}</div>
              </div>
            ))}
          </div>

          {/* Two-col: bookings list + aside */}
          <div className="sd-grid2">
            {/* Bookings card */}
            <div className="sd-card">
              <div className="sd-card__head">
                <span className="sd-card__title">Recent Live Bookings</span>
                <input
                  placeholder="Search…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    background: 'rgba(255,255,255,.04)',
                    border: '1px solid rgba(91,143,232,.2)',
                    borderRadius: 8,
                    padding: '6px 12px',
                    color: '#F5F0E8',
                    fontSize: 13,
                    outline: 'none',
                    width: 160,
                  }}
                />
              </div>
              <div className="sd-card__body" style={{ padding: '0 20px' }}>
                {loading ? (
                  <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(245,240,232,.35)' }}>Loading...</div>
                ) : filtered.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(245,240,232,.35)', fontSize: 14 }}>
                    No bookings found in database
                  </div>
                ) : filtered.map(b => (
                  <div key={b._id} className="sd-booking">
                    <div className="sd-booking__top">
                      <div>
                        <div className="sd-booking__title">{b.partyName} <span style={{ fontSize: 20, color: '#9D9880' }}>{b.personalDetails.name}</span></div>
                        <div className="sd-booking__sub">{b.clientName} · {b.date ? new Date(b.date).toLocaleDateString('en-IN') : 'TBD'} · {b.venue} · {b.pax} pax</div>
                      </div>
                      <span className={`sd-badge ${STATUS_BADGE[b.status] || 'sd-badge--blue'}`}>
                        {b.status}
                      </span>
                    </div>
                    <div className="sd-progress">
                      <div className="sd-progress__fill" style={{ width: b.status === 'confirmed' ? '85%' : b.status === 'temporary' ? '55%' : '30%' }} />
                    </div>
                    <button className="sd-link-btn" onClick={() => navigate(`/sales/booking/${b._id}`)}>View Details →</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Aside */}
            <div className="sd-aside">
              {/* Pipeline funnel */}
              <div className="sd-card">
                <div className="sd-card__head">
                  <span className="sd-card__title">Sales Pipeline</span>
                  <span className="sd-card__count">{bookings.filter(b => b.status !== 'cancelled').length} total</span>
                </div>
                <div className="sd-card__body">
                  {loading ? (<div style={{ padding: '20px', textAlign: 'center', color: '#555' }}>Loading...</div>) : pipeline.map(p => (
                    <div key={p.stage} className="sd-funnel__item">
                      <div className="sd-funnel__bar-wrap">
                        <div className="sd-funnel__bar" style={{ width: `${p.pct}%`, background: p.color }} />
                      </div>
                      <div className="sd-funnel__meta">
                        <span className="sd-funnel__stage">{p.stage}</span>
                        <div className="sd-funnel__nums">
                          <span className="sd-funnel__count" style={{ color: p.color }}>{p.count}</span>
                          <span className="sd-funnel__val">{p.value}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Upcoming schedule */}
              <div className="sd-card">
                <div className="sd-card__head">
                  <span className="sd-card__title">Upcoming Events</span>
                </div>
                <div className="sd-card__body" style={{ padding: '0 20px' }}>
                  {schedule.length === 0 ? (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#555' }}>No upcoming events scheduled</div>
                  ) : schedule.map((s, i) => (
                    <div key={i} className="sd-schedule__item">
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span className="sd-schedule__time">{s.time}</span>
                        <span style={{ fontSize: 10, color: '#9D9880' }}>{s.date}</span>
                      </div>
                      <div>
                        <div className="sd-schedule__label">{s.label}</div>
                        <span className={`sd-schedule__tag sd-schedule__tag--${s.tag === 'confirmed' ? 'green' : 'amber'}`}>{s.tag}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alerts */}
              <div className="sd-card">
                <div className="sd-card__head">
                  <span className="sd-card__title">Notifications</span>
                </div>
                <div className="sd-card__body">
                  <div className="sd-alert">
                    <div className="sd-alert__icon">ℹ</div>
                    <div>
                      <div className="sd-alert__title">Live Database Sync Active</div>
                      <div className="sd-alert__desc">Dashboard metrics are computed in real time from bookings stored in MongoDB.</div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  );
}