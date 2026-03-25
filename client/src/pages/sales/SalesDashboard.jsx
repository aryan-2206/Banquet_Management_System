import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from '../../components/shared/StatusBadge';
import './SalesDashboard.css';

/* ─── Mock data (replace with API calls) ─────────────────────────── */
const STATS = [
  { label: 'Active Bookings',  value: 24,      unit: '',   trend: '+3 this week',  up: true  },
  { label: 'Revenue Pipeline', value: '₹18.4L', unit: '',  trend: '+12% vs last month', up: true },
  { label: 'Pending Enquiries',value: 7,       unit: '',   trend: '2 need follow-up', up: false },
  { label: 'Avg. Pax / Event', value: 280,     unit: 'pax', trend: 'Target: 300',  up: null  },
];

const PIPELINE = [
  { stage: 'New Enquiry',   count: 7,  value: '₹4.2L', color: '#C9A96E' },
  { stage: 'Menu Pending',  count: 5,  value: '₹3.8L', color: '#A07840' },
  { stage: 'Finance Review',count: 4,  value: '₹5.1L', color: '#6B7C6E' },
  { stage: 'Confirmed',     count: 8,  value: '₹5.3L', color: '#3A7A6E' },
];

const BOOKINGS = [
  {
    id: 'BK-2601', party: 'Mehta Wedding',  client: 'Rakesh Mehta',
    date: '14 Jul 2026', venue: 'Grand Ballroom', pax: 450, tier: 'Elite',
    status: 'confirmed', manager: 'Priya S.',
  },
  {
    id: 'BK-2598', party: 'Sharma Birthday', client: 'Neha Sharma',
    date: '18 Jul 2026', venue: 'Terrace Garden', pax: 120, tier: 'Premium',
    status: 'enquiry', manager: 'Aryan D.',
  },
  {
    id: 'BK-2593', party: 'Kapoor Reception', client: 'Vijay Kapoor',
    date: '22 Jul 2026', venue: 'Crystal Hall',   pax: 320, tier: 'Elite',
    status: 'booked',   manager: 'Priya S.',
  },
  {
    id: 'BK-2590', party: 'Tech Conf. Dinner', client: 'Infosys Ltd.',
    date: '25 Jul 2026', venue: 'Banquet Suite A', pax: 200, tier: 'Standard',
    status: 'confirmed', manager: 'Rohan K.',
  },
  {
    id: 'BK-2585', party: 'Gupta Anniversary', client: 'Sunil Gupta',
    date: '02 Aug 2026', venue: 'Rooftop Lounge', pax: 80, tier: 'Premium',
    status: 'temporary', manager: 'Aryan D.',
  },
  {
    id: 'BK-2580', party: 'Patel Engagement',  client: 'Meera Patel',
    date: '10 Aug 2026', venue: 'Garden Pavilion', pax: 160, tier: 'Premium',
    status: 'enquiry',  manager: 'Rohan K.',
  },
];

const UPCOMING = [
  { time: '10:00', label: 'Site visit — Mehta Wedding', tag: 'confirmed' },
  { time: '12:30', label: 'Client call — Sharma Birthday', tag: 'enquiry' },
  { time: '15:00', label: 'Finance review — Kapoor Reception', tag: 'finance' },
  { time: '17:30', label: 'Menu tasting — Gupta Anniversary', tag: 'ops' },
];

const TIER_COLORS = { Standard: '#6B7C6E', Premium: '#C9A96E', Elite: '#A07840' };

/* ─── Component ────────────────────────────────────────────────────── */
export default function SalesDashboard({ onBack }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = BOOKINGS.filter(b => {
    const matchSearch =
      b.party.toLowerCase().includes(search.toLowerCase()) ||
      b.client.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || b.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="s-root">
      {/* ── Topbar ── */}
      <div className="s-topbar">
        <div className="s-topbar__brand">
          <div className="s-topbar__logo">S</div>
          <div>
            <div className="s-topbar__title">Sales Dashboard</div>
            <div className="s-topbar__sub">Banquet IntelliManager</div>
          </div>
        </div>
        <button 
          onClick={onBack}
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-[#F5F0E8] hover:bg-[rgba(91,143,232,0.1)] transition-colors"
          style={{ border: '1px solid rgba(91,143,232,0.2)' }}
        >
          ← Back
        </button>
      </div>

      {/* ── Layout ── */}
      <div className="s-layout">
        {/* Left Navigation */}
        <div className="s-leftNav">
          <div className="s-navTile s-navTile--active">
            <div className="s-navTile__bg" style={{ background: `radial-gradient(ellipse at 20% 20%, rgba(91,143,232,0.22) 0%, transparent 60%)` }} />
            <div className="s-navTile__content">
              <div className="s-navTile__title">Dashboard</div>
              <div className="s-navTile__subtitle">Overview of sales pipeline</div>
            </div>
          </div>
          <div className="s-navTile">
            <div className="s-navTile__bg" style={{ background: `radial-gradient(ellipse at 20% 20%, rgba(91,143,232,0.22) 0%, transparent 60%)` }} />
            <div className="s-navTile__content">
              <div className="s-navTile__title">Bookings</div>
              <div className="s-navTile__subtitle">Manage all bookings</div>
            </div>
          </div>
          <div className="s-navTile">
            <div className="s-navTile__bg" style={{ background: `radial-gradient(ellipse at 20% 20%, rgba(91,143,232,0.22) 0%, transparent 60%)` }} />
            <div className="s-navTile__content">
              <div className="s-navTile__title">Analytics</div>
              <div className="s-navTile__subtitle">Sales insights</div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="s-main">
          {/* Hero Strip */}
          <div className="s-heroStrip">
            <div>
              <div className="s-heroStrip__kicker">Sales Overview</div>
              <div className="s-heroStrip__headline">Welcome to Sales Dashboard</div>
              <div className="s-heroStrip__meta">{new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</div>
            </div>
            <button className="s-heroStrip__cta" style={{ background: '#5B8FE8', border: '1px solid #5B8FE8', color: 'white' }}>
              + New Booking
            </button>
          </div>

          {/* Stats Grid */}
          <div className="s-grid4">
            {STATS.map((s, i) => (
              <div key={s.label} className="s-statCard" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="s-statValue" style={{ color: '#5B8FE8' }}>
                  {s.value}
                </div>
                <div className="s-statLabel">{s.label}</div>
                <div className="s-statSub">{s.trend}</div>
              </div>
            ))}
          </div>

          {/* Bookings Grid */}
          <div className="s-bookings">
            <div className="s-sectionHead">
              <div>
                <div className="s-sectionHead__title">Recent Bookings</div>
                <div className="s-sectionHead__sub">Latest booking activities</div>
              </div>
            </div>
            {filtered.slice(0, 4).map((b, i) => (
              <div key={b.id} className="s-bookingCard">
                <div className="s-bookingCard__top">
                  <div>
                    <div className="s-bookingCard__title">{b.party}</div>
                    <div className="s-bookingCard__sub">{b.client} · {b.date} · {b.venue}</div>
                  </div>
                  <span className="s-badge s-badge--blue">{b.status}</span>
                </div>
                <div className="s-progress">
                  <div className="s-progress__inner" style={{ width: '75%', background: '#5B8FE8' }} />
                </div>
                <div className="s-bookingCard__bottom">
                  <button className="s-linkBtn">View Details →</button>
                </div>
              </div>
            ))}
          </div>

          {/* Alerts Section */}
          <div className="s-sectionHead">
            <div>
              <div className="s-sectionHead__title">Notifications</div>
              <div className="s-sectionHead__sub">Important updates</div>
            </div>
          </div>
          <div className="s-alertGrid">
            <div className="s-alert s-alert--blue">
              <div className="s-alert__icon">!</div>
              <div className="s-alert__text">
                <div className="s-alert__title">Follow-up Required</div>
                <div className="s-alert__desc">2 bookings need follow-up calls</div>
              </div>
            </div>
            <div className="s-alert s-alert--blue">
              <div className="s-alert__icon">✓</div>
              <div className="s-alert__text">
                <div className="s-alert__title">New Booking</div>
                <div className="s-alert__desc">Mehta Wedding confirmed</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}