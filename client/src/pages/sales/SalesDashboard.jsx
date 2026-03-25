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
export default function SalesDashboard() {
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
    <div className="sd">
      {/* ── Header ── */}
      <header className="sd__header fade-up">
        <div>
          <p className="sd__header-date">{new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}</p>
          <h1 className="sd__header-title">Sales Dashboard</h1>
        </div>
        <Link to="/sales/new" className="sd__cta">
          <span>＋</span> New Booking
        </Link>
      </header>

      {/* ── Stats Row ── */}
      <div className="sd__stats">
        {STATS.map((s, i) => (
          <div key={s.label} className={`sd__stat-card fade-up fade-up-${i + 1}`}>
            <span className="sd__stat-label">{s.label}</span>
            <div className="sd__stat-value">
              {s.value}<span className="sd__stat-unit">{s.unit}</span>
            </div>
            <span className={`sd__stat-trend ${s.up === true ? 'sd__stat-trend--up' : s.up === false ? 'sd__stat-trend--down' : ''}`}>
              {s.up === true ? '↑' : s.up === false ? '↗' : '→'} {s.trend}
            </span>
          </div>
        ))}
      </div>

      {/* ── Main Grid ── */}
      <div className="sd__grid">

        {/* Left: Bookings table */}
        <section className="sd__bookings fade-up fade-up-3">
          <div className="sd__section-head">
            <h2 className="sd__section-title">Booking Pipeline</h2>
            <div className="sd__controls">
              <div className="sd__search-wrap">
                <span className="sd__search-icon">⊘</span>
                <input
                  className="sd__search"
                  placeholder="Search bookings…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="sd__filters">
                {['all','enquiry','temporary','booked','confirmed'].map(f => (
                  <button
                    key={f}
                    className={`sd__filter ${filter === f ? 'sd__filter--active' : ''}`}
                    onClick={() => setFilter(f)}
                  >
                    {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="sd__table-wrap">
            <table className="sd__table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Party / Client</th>
                  <th>Date</th>
                  <th>Venue</th>
                  <th>Pax</th>
                  <th>Tier</th>
                  <th>Status</th>
                  <th>Manager</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((b, i) => (
                  <tr key={b.id} style={{ animationDelay: `${i * 0.05}s` }} className="sd__row">
                    <td><span className="sd__id">{b.id}</span></td>
                    <td>
                      <div className="sd__party">{b.party}</div>
                      <div className="sd__client-name">{b.client}</div>
                    </td>
                    <td className="sd__date">{b.date}</td>
                    <td className="sd__venue">{b.venue}</td>
                    <td><span className="sd__pax">{b.pax.toLocaleString()}</span></td>
                    <td>
                      <span className="sd__tier" style={{ '--tier-color': TIER_COLORS[b.tier] }}>
                        {b.tier}
                      </span>
                    </td>
                    <td><StatusBadge status={b.status} dot /></td>
                    <td className="sd__mgr">{b.manager}</td>
                    <td>
                      <Link to={`/sales/${b.id}`} className="sd__view-btn">View →</Link>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="sd__empty">No bookings match your search.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Right sidebar */}
        <aside className="sd__aside">

          {/* Pipeline funnel */}
          <div className="sd__card fade-up fade-up-4">
            <h3 className="sd__card-title">Funnel Overview</h3>
            <div className="sd__funnel">
              {PIPELINE.map((p, i) => (
                <div key={p.stage} className="sd__funnel-item">
                  <div className="sd__funnel-bar-wrap">
                    <div
                      className="sd__funnel-bar"
                      style={{
                        width: `${(p.count / 8) * 100}%`,
                        background: p.color,
                        opacity: 0.85,
                      }}
                    />
                  </div>
                  <div className="sd__funnel-meta">
                    <span className="sd__funnel-stage">{p.stage}</span>
                    <div className="sd__funnel-nums">
                      <span className="sd__funnel-count">{p.count}</span>
                      <span className="sd__funnel-value">{p.value}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Today's schedule */}
          <div className="sd__card fade-up fade-up-5">
            <h3 className="sd__card-title">Today's Schedule</h3>
            <div className="sd__schedule">
              {UPCOMING.map((u, i) => (
                <div key={i} className="sd__schedule-item">
                  <span className="sd__schedule-time">{u.time}</span>
                  <div className="sd__schedule-body">
                    <div className="sd__schedule-label">{u.label}</div>
                    <span className={`sd__schedule-tag sd__schedule-tag--${u.tag}`}>{u.tag}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="sd__card fade-up fade-up-5">
            <h3 className="sd__card-title">Quick Actions</h3>
            <div className="sd__actions">
              <Link to="/sales/new"       className="sd__action-btn">＋ New Enquiry</Link>
              <Link to="/sales/calendar"  className="sd__action-btn">▦ Venue Calendar</Link>
              <Link to="/finance/ledger"  className="sd__action-btn">◎ Payment Ledger</Link>
              <Link to="/admin/reports"   className="sd__action-btn">▣ Run Report</Link>
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
}