import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SalesDashboard.css';

/* ─── Mock data ───────────────────────────────────────────── */
const STATS = [
  { label: 'Active Bookings',   value: '24',    trend: '+3 this week' },
  { label: 'Revenue Pipeline',  value: '₹18.4L', trend: '+12% vs last month' },
  { label: 'Pending Enquiries', value: '7',     trend: '2 need follow-up' },
  { label: 'Avg Pax / Event',   value: '280',   trend: 'Target: 300 pax' },
];

const BOOKINGS = [
  { id: 'BK-2601', party: 'Mehta Wedding',      client: 'Rakesh Mehta',  date: '14 Jul 2026', venue: 'Grand Ballroom',  pax: 450, status: 'confirmed' },
  { id: 'BK-2598', party: 'Sharma Birthday',    client: 'Neha Sharma',   date: '18 Jul 2026', venue: 'Terrace Garden',  pax: 120, status: 'enquiry'   },
  { id: 'BK-2593', party: 'Kapoor Reception',   client: 'Vijay Kapoor',  date: '22 Jul 2026', venue: 'Crystal Hall',    pax: 320, status: 'confirmed' },
  { id: 'BK-2590', party: 'Tech Conf. Dinner',  client: 'Infosys Ltd.',  date: '25 Jul 2026', venue: 'Banquet Suite A', pax: 200, status: 'confirmed' },
  { id: 'BK-2585', party: 'Gupta Anniversary',  client: 'Sunil Gupta',   date: '02 Aug 2026', venue: 'Rooftop Lounge',  pax: 80,  status: 'temporary' },
  { id: 'BK-2580', party: 'Patel Engagement',   client: 'Meera Patel',   date: '10 Aug 2026', venue: 'Garden Pavilion', pax: 160, status: 'enquiry'   },
];

const PIPELINE = [
  { stage: 'New Enquiry',    count: 7, value: '₹4.2L', color: '#5B8FE8', pct: 43 },
  { stage: 'Menu Pending',   count: 5, value: '₹3.8L', color: '#E8C455', pct: 31 },
  { stage: 'Finance Review', count: 4, value: '₹5.1L', color: '#9B6DE8', pct: 25 },
  { stage: 'Confirmed',      count: 8, value: '₹5.3L', color: '#5FBF8A', pct: 50 },
];

const SCHEDULE = [
  { time: '10:00', label: 'Site visit — Mehta Wedding',        tag: 'confirmed' },
  { time: '12:30', label: 'Client call — Sharma Birthday',     tag: 'enquiry'   },
  { time: '15:00', label: 'Finance review — Kapoor Reception', tag: 'finance'   },
  { time: '17:30', label: 'Menu tasting — Gupta Anniversary',  tag: 'ops'       },
];

const STATUS_BADGE = {
  confirmed: 'sd-badge--green',
  enquiry:   'sd-badge--amber',
  temporary: 'sd-badge--purple',
  booked:    'sd-badge--blue',
};

/* ─── Component ───────────────────────────────────────────── */
export default function SalesDashboard() {
  const navigate = useNavigate();
  const [activeNav, setActiveNav] = useState('dashboard');
  const [search, setSearch]       = useState('');

  const filtered = BOOKINGS.filter(b =>
    b.party.toLowerCase().includes(search.toLowerCase()) ||
    b.client.toLowerCase().includes(search.toLowerCase()) ||
    b.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="sd-root">

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

      {/* ── Body: sidebar + main ── */}
      <div className="sd-body">

        {/* ── Left nav ── */}
        <nav className="sd-sidenav">
          {[
            { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
            { id: 'bookings',  icon: '📋', label: 'Bookings'  },
            { id: 'analytics', icon: '📊', label: 'Analytics' },
            { id: 'clients',   icon: '👥', label: 'Clients'   },
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
            <button className="sd-hero__cta" onClick={() => navigate('/sales/new')}>
              + New Booking
            </button>
          </div>

          {/* Stats */}
          <div className="sd-stats">
            {STATS.map(s => (
              <div key={s.label} className="sd-stat">
                <div className="sd-stat__val">{s.value}</div>
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
                <span className="sd-card__title">Recent Bookings</span>
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
                {filtered.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '32px 0', color: 'rgba(245,240,232,.35)', fontSize: 14 }}>
                    No bookings match your search
                  </div>
                ) : filtered.map(b => (
                  <div key={b.id} className="sd-booking">
                    <div className="sd-booking__top">
                      <div>
                        <div className="sd-booking__title">{b.party}</div>
                        <div className="sd-booking__sub">{b.client} · {b.date} · {b.venue} · {b.pax} pax</div>
                      </div>
                      <span className={`sd-badge ${STATUS_BADGE[b.status] || 'sd-badge--blue'}`}>
                        {b.status}
                      </span>
                    </div>
                    <div className="sd-progress">
                      <div className="sd-progress__fill" style={{ width: b.status === 'confirmed' ? '85%' : b.status === 'temporary' ? '55%' : '30%' }} />
                    </div>
                    <button className="sd-link-btn">View Details →</button>
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
                  <span className="sd-card__count">24 total</span>
                </div>
                <div className="sd-card__body">
                  {PIPELINE.map(p => (
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

              {/* Today's schedule */}
              <div className="sd-card">
                <div className="sd-card__head">
                  <span className="sd-card__title">Today's Schedule</span>
                </div>
                <div className="sd-card__body" style={{ padding: '0 20px' }}>
                  {SCHEDULE.map((s, i) => (
                    <div key={i} className="sd-schedule__item">
                      <span className="sd-schedule__time">{s.time}</span>
                      <div>
                        <div className="sd-schedule__label">{s.label}</div>
                        <span className={`sd-schedule__tag sd-schedule__tag--${s.tag}`}>{s.tag}</span>
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
                    <div className="sd-alert__icon">!</div>
                    <div>
                      <div className="sd-alert__title">Follow-up Required</div>
                      <div className="sd-alert__desc">2 bookings need follow-up calls today</div>
                    </div>
                  </div>
                  <div className="sd-alert">
                    <div className="sd-alert__icon">✓</div>
                    <div>
                      <div className="sd-alert__title">Booking Confirmed</div>
                      <div className="sd-alert__desc">Mehta Wedding deposit received</div>
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