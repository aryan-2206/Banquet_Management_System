import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/shared/Sidebar';
import BookingStatusBadge from './BookingStatusBadge';
import BookingStatusToggle from './BookingStatusToggle';
import PaymentEntryModal from './PaymentEntryModal';
import FinanceAuditLog from './FinanceAuditLog';
import useFinanceStore from './useFinanceStore';
import { formatINR, animateCounter } from './useInstallmentLogic';
import './FinanceDashboard.css';

/* ── Inline SVG Icons (same pattern as LandingPage) ── */
const Icon = ({ d, size = 20, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);
const ICONS = {
  overview:      'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z',
  ledger:        'M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2zM22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z',
  installments:  'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z',
  gst:           'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6',
  queue:         'M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2',
  bell:          'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0',
  search:        'M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0',
  trendUp:       'M23 6l-9.5 9.5-5-5L1 18',
  trendDown:     'M23 18l-9.5-9.5-5 5L1 6',
  check:         'M20 6 9 17l-5-5',
  inr:           'M6 3h12M6 8h12M6 13h6M6 18h6M12 8c0 2.7-2 5-6 5M12 13l4 5',
  activity:      'M22 12h-4l-3 9L9 3l-3 9H2',
  eye:           'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
  record:        'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
};

/* ── Animated Counter Hook ── */
function useAnimatedCounter(target, run = true) {
  const [val, setVal] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    if (!run) return;
    const id = animateCounter(target, 1200, setVal, null);
    return () => {};
  }, [target, run]);
  return val;
}

/* ── Sparkline SVG ── */
function Sparkline({ data = [], color = '#C9A84C', height = 32 }) {
  if (!data.length) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const w = 80, h = height;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / (max - min || 1)) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} fill="none">
      <polyline points={pts} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
      <polyline points={`0,${h} ${pts} ${w},${h}`} stroke="none" fill={`${color}18`} />
    </svg>
  );
}

/* ── Metric Card ── */
function MetricCard({ title, value, prefix = '', suffix = '', sub, sub2, color, trend, trendPct, sparkData, bar, barLabel, delay = 0 }) {
  const animated = useAnimatedCounter(Math.round(value), true);
  return (
    <div className="fd-metric-card glass glass-hover animate-fade-up"
      style={{ animationDelay: `${delay}ms` }}>
      <div className="fd-metric-top">
        <span className="fd-metric-title">{title}</span>
        {trend && (
          <span className={`fd-trend ${trend === 'up' ? 'fd-trend--up' : 'fd-trend--down'}`}>
            <Icon d={trend === 'up' ? ICONS.trendUp : ICONS.trendDown} size={12} />
            {trendPct}
          </span>
        )}
      </div>
      <div className="fd-metric-value" style={{ color: color || '#F5F0E8' }}>
        {prefix}{animated.toLocaleString('en-IN')}{suffix}
      </div>
      {sparkData && <Sparkline data={sparkData} color={color || '#C9A84C'} />}
      {sub  && <p className="fd-metric-sub">{sub}</p>}
      {sub2 && <p className="fd-metric-sub2">{sub2}</p>}
      {bar !== undefined && (
        <div className="fd-metric-bar-wrap" title={barLabel}>
          <div className="fd-metric-bar-fill" style={{ width: `${Math.min(bar, 100)}%`, background: color || '#C9A84C' }} />
        </div>
      )}
    </div>
  );
}

/* ── Finance Sidebar (local, finance-specific tabs) ── */
const FIN_NAV = [
  { id: 'overview',      label: 'Overview',          icon: ICONS.overview,     to: '/finance' },
  { id: 'ledger',        label: 'Payment Ledger',    icon: ICONS.ledger,       to: '/finance/ledger' },
  { id: 'installments',  label: 'Installment Plans', icon: ICONS.installments, to: '/finance/installments' },
  { id: 'gst',           label: 'GST Report',        icon: ICONS.gst,          to: '/finance/gst' },
  { id: 'queue',         label: 'Booking Queue',     icon: ICONS.queue,        to: '/finance',  badge: true },
];

function FinanceSidebar({ active, onNav, pendingCount }) {
  return (
    <aside className="fd-sidebar glass">
      {/* Logo */}
      <div className="fd-sidebar__brand">
        <div className="fd-sidebar__logo">₹</div>
        <div>
          <div className="fd-sidebar__name">Finance</div>
          <div className="fd-sidebar__sub">IntelliManager</div>
        </div>
      </div>
      <nav className="fd-sidebar__nav">
        <p className="fd-sidebar__group-label">MODULE</p>
        {FIN_NAV.map((item) => (
          <button key={item.id}
            className={`fd-sidebar__item ${active === item.id ? 'fd-sidebar__item--active' : ''}`}
            onClick={() => onNav(item)}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d={item.icon} />
            </svg>
            <span className="fd-sidebar__label">{item.label}</span>
            {item.badge && pendingCount > 0 && (
              <span className="fd-sidebar__badge">{pendingCount}</span>
            )}
          </button>
        ))}
      </nav>
      <div className="fd-sidebar__user">
        <div className="fd-sidebar__avatar">AS</div>
        <div>
          <div className="fd-sidebar__user-name">Ananya Shah</div>
          <div className="fd-sidebar__user-role">Finance Manager</div>
        </div>
      </div>
    </aside>
  );
}

/* ── Booking Queue Table ── */
function BookingQueueTable({ bookings, onRecordPayment, onViewPlan }) {
  const navigate = useNavigate();
  if (!bookings.length) return (
    <div className="fd-empty">
      <div className="fd-empty__icon">◎</div>
      <h3 className="fd-empty__title">No bookings yet</h3>
      <p className="fd-empty__sub">Bookings added by the Sales team will appear here for payment processing.</p>
    </div>
  );

  return (
    <div className="fd-table-wrap">
      <table className="fd-table">
        <thead>
          <tr className="fd-table__head">
            {['Booking ID','Client','Event Date','Hall','Total','Paid','Outstanding','Status','Actions'].map(h => (
              <th key={h} className="fd-table__th">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bookings.map((b, i) => {
            const totalPaid = b.payments.reduce((a, p) => a + p.amount, 0);
            const outstanding = b.totalValue - totalPaid;
            return (
              <tr key={b.id} className="fd-table__row animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                <td className="fd-table__td fd-table__td--id">{b.id}</td>
                <td className="fd-table__td">
                  <div className="fd-table__client">{b.clientName}</div>
                  <div className="fd-table__phone">{b.clientPhone}</div>
                </td>
                <td className="fd-table__td">
                  <div>{b.eventDate}</div>
                  <div className="fd-table__shift">{b.shift}</div>
                </td>
                <td className="fd-table__td">{b.hall}</td>
                <td className="fd-table__td fd-table__td--num">{formatINR(b.totalValue)}</td>
                <td className="fd-table__td fd-table__td--num fd-table__td--green">{formatINR(totalPaid)}</td>
                <td className={`fd-table__td fd-table__td--num ${outstanding > 0 ? 'fd-table__td--red' : 'fd-table__td--green'}`}>
                  {outstanding > 0 ? formatINR(outstanding) : '—'}
                </td>
                <td className="fd-table__td">
                  <BookingStatusBadge status={b.status} />
                </td>
                <td className="fd-table__td">
                  <div className="fd-table__actions">
                    {b.status !== 'settled' && (
                      <button className="fd-action-btn" onClick={() => onRecordPayment(b.id)}
                        aria-label={`Record payment for ${b.clientName}`}>
                        <Icon d={ICONS.record} size={14} /> Pay
                      </button>
                    )}
                    <button className="fd-action-btn fd-action-btn--outline"
                      onClick={() => onViewPlan(b.id)}
                      aria-label={`View plan for ${b.clientName}`}>
                      <Icon d={ICONS.eye} size={14} /> Plan
                    </button>
                    {b.status === 'deposit' && (
                      <BookingStatusToggle bookingId={b.id} />
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/* ── Main Dashboard ── */
export default function FinanceDashboard() {
  const navigate = useNavigate();
  const bookings      = useFinanceStore((s) => s.bookings);
  const selectBooking = useFinanceStore((s) => s.selectBooking);
  const fetchPayments = useFinanceStore((s) => s.fetchPayments);
  const loading       = useFinanceStore((s) => s.loading);

  const [activeTab, setActiveTab]     = useState('overview');
  const [search, setSearch]           = useState('');
  const [logOpen, setLogOpen]         = useState(false);
  const [payModalId, setPayModalId]   = useState(null);
  const [notifDot, setNotifDot]       = useState(true);
  const [mounted, setMounted]         = useState(false);

  useEffect(() => { 
    setMounted(true); 
    fetchPayments();
  }, [fetchPayments]);

  const pendingCount  = bookings.filter((b) => b.status === 'temporary').length;
  const overdueCount  = bookings.filter((b) => b.status === 'overdue').length;
  const settledCount  = bookings.filter((b) => b.status === 'settled').length;
  const monthRevenue  = bookings.filter((b) => b.status !== 'cancelled').reduce((a, b) => a + b.totalValue, 0);
  const outstanding   = bookings.reduce((a, b) => {
    const paid = b.payments.reduce((s, p) => s + p.amount, 0);
    return a + Math.max(0, b.totalValue - paid);
  }, 0);

  const filteredBookings = bookings.filter((b) =>
    b.clientName.toLowerCase().includes(search.toLowerCase()) ||
    b.id.toLowerCase().includes(search.toLowerCase()) ||
    b.eventDate.includes(search)
  );

  function handleNav(item) {
    setActiveTab(item.id);
    navigate(item.to);
  }

  return (
    <div className={`fd-root ${mounted ? 'fd-root--mounted' : ''}`}>
      <FinanceSidebar active={activeTab} onNav={handleNav} pendingCount={pendingCount} />

      <div className="fd-main">
        {/* ── Header ── */}
        <header className="fd-header glass">
          <div className="fd-header__left">
            <h1 className="fd-header__title">
              Finance <span className="gold-shimmer">Manager</span>
            </h1>
            <p className="fd-header__date">
              {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>

          <div className="fd-header__search">
            <Icon d={ICONS.search} size={16} className="fd-header__search-icon" />
            <input className="fd-header__search-input" placeholder="Search client, booking ID, date…"
              value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search bookings" />
          </div>

          <div className="fd-header__right">
            <button className="fd-header__activity" onClick={() => setLogOpen(true)} aria-label="Open activity log">
              <Icon d={ICONS.activity} size={18} />
            </button>
            <button className="fd-header__bell" onClick={() => setNotifDot(false)} aria-label="Notifications">
              <Icon d={ICONS.bell} size={20} />
              {notifDot && overdueCount > 0 && <span className="fd-header__bell-dot" />}
            </button>
            <div className="fd-header__avatar" aria-label="Finance Manager: Ananya Shah">AS</div>
          </div>
        </header>

        {/* ── Metrics ── */}
        <section className="fd-metrics">
          <MetricCard
            title="Total Revenue This Month"
            prefix="₹" value={monthRevenue / 100000} suffix="L"
            trend="up" trendPct="+12%"
            sparkData={[42, 55, 48, 61, 58, 72, 68, 80, 75, 91, 85, 96, 90, monthRevenue / 50000]}
            color="#C9A84C"
            delay={0}
          />
          <MetricCard
            title="Outstanding Payments"
            prefix="₹" value={outstanding / 1000} suffix="K"
            sub={`${overdueCount} booking${overdueCount !== 1 ? 's' : ''} with overdue installments`}
            sub2={overdueCount > 0 ? '⚠ Overdue by 3+ days' : undefined}
            color="#E85555"
            delay={80}
          />
          <MetricCard
            title="Pending Confirmations"
            value={pendingCount}
            sub="Awaiting payment receipt"
            color="#E8C455"
            delay={160}
          />
          <MetricCard
            title="Fully Settled This Month"
            value={settledCount}
            suffix=" events"
            sub={`${formatINR(bookings.filter(b=>b.status==='settled').reduce((a,b)=>a+b.totalValue,0))} total value`}
            bar={Math.round((settledCount / Math.max(bookings.length, 1)) * 100)}
            barLabel={`${Math.round((settledCount / Math.max(bookings.length, 1)) * 100)}% of bookings settled`}
            color="#5FBF8A"
            delay={240}
          />
        </section>

        {/* ── Booking Queue ── */}
        <section className="fd-section">
          <div className="fd-section__header">
            <h2 className="fd-section__title">Booking Queue</h2>
            <span className="fd-section__count">{loading ? 'Loading...' : `${filteredBookings.length} bookings`}</span>
          </div>
          {loading ? (
             <div style={{ textAlign: 'center', padding: '40px', color: '#9D9880' }}>Loading payment queue from database...</div>
          ) : (
            <BookingQueueTable
              bookings={filteredBookings}
              onRecordPayment={(id) => { selectBooking(id); setPayModalId(id); }}
              onViewPlan={(id) => { selectBooking(id); navigate('/finance/installments'); }}
            />
          )}
        </section>
      </div>

      {/* ── Modals & Drawers ── */}
      {payModalId && (
        <PaymentEntryModal
          bookingId={payModalId}
          onClose={() => setPayModalId(null)}
          onSaved={() => setPayModalId(null)}
        />
      )}
      <FinanceAuditLog open={logOpen} onClose={() => setLogOpen(false)} />
    </div>
  );
}
