import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useFinanceStore from './useFinanceStore';
import PaymentEntryModal from './PaymentEntryModal';
import BookingStatusBadge from './BookingStatusBadge';
import { formatINR } from './useInstallmentLogic';

const Icon = ({ d, size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);
const ICONS = {
  back:    'M19 12H5M12 5l-7 7 7 7',
  add:     'M12 5v14M5 12h14',
  receipt: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6M16 13H8M16 17H8M10 9H8',
  user:    'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
  check:   'M20 6 9 17l-5-5',
};

function SegmentedBar({ segments }) {
  const [widths, setWidths] = useState(segments.map(() => 0));
  useEffect(() => {
    const t = setTimeout(() => setWidths(segments.map((s) => s.pct)), 80);
    return () => clearTimeout(t);
  }, [segments]);

  return (
    <div className="pl-bar">
      {segments.map((seg, i) => (
        <div key={seg.label} className="pl-bar__segment"
          style={{ width: `${widths[i]}%`, background: seg.color,
            transition: `width 500ms ${i * 200}ms cubic-bezier(.4,0,.2,1)` }}
          title={`${seg.label}: ${formatINR(seg.amount)}`}
        />
      ))}
    </div>
  );
}

function SummaryBar({ booking }) {
  const tranches = booking.installmentPlan?.tranches || [];
  const totalPaid = tranches.filter(t => t.status === 'paid').reduce((a, t) => a + t.amount, 0);
  const outstanding = booking.totalValue - totalPaid;

  const pct = (v) => booking.totalValue ? Math.round((v / booking.totalValue) * 100) : 0;
  const segments = tranches.map((t, i) => ({
    label: t.label,
    pct: t.status === 'paid' ? pct(t.amount) : 0,
    amount: t.status === 'paid' ? t.amount : 0,
    color: i === 0 ? '#5B8FE8' : i === 1 ? '#C9A84C' : '#5FBF8A'
  })).filter(s => s.pct > 0);

  return (
    <div className="pl-summary glass">
      <div className="pl-summary__cols">
        <div className="pl-summary__col">
          <p className="pl-summary__label">Total Billed</p>
          <p className="pl-summary__val">{formatINR(booking.totalValue)}</p>
        </div>
        <div className="pl-summary__divider" />
        <div className="pl-summary__col">
          <p className="pl-summary__label">Total Received</p>
          <p className="pl-summary__val pl-summary__val--green">{formatINR(totalPaid)}</p>
        </div>
        <div className="pl-summary__divider" />
        <div className="pl-summary__col">
          <p className="pl-summary__label">Outstanding Balance</p>
          <p className={`pl-summary__val ${outstanding > 0 ? 'pl-summary__val--red' : 'pl-summary__val--green'}`}>
            {outstanding > 0 ? formatINR(outstanding) : '✓ Fully Settled'}
          </p>
        </div>
      </div>
      {segments.length > 0 && (
        <div className="pl-bar-section">
          <SegmentedBar segments={segments} />
          <div className="pl-bar-legend">
            {segments.map((l) => (
              <span key={l.label} className="pl-bar-legend__item">
                <span className="pl-bar-legend__dot" style={{ background: l.color }} />
                {l.label}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function PaymentLedger() {
  const navigate  = useNavigate();
  const booking   = useFinanceStore((s) => s.getSelectedBooking());
  const bookings  = useFinanceStore((s) => s.bookings);
  const selectBooking = useFinanceStore((s) => s.selectBooking);
  const toggleTranche = useFinanceStore((s) => s.toggleTranche);

  const [togglingIdx, setTogglingIdx] = useState(null);

  if (!booking) return (
    <div className="pl-root">
      <div className="pl-empty-select glass">
        <p className="pl-empty-select__text">Select a booking from the dashboard to view its ledger.</p>
        <button className="btn-gold" onClick={() => navigate('/finance')}><span>← Back to Dashboard</span></button>
      </div>
    </div>
  );

  const tranches = booking.installmentPlan?.tranches || [];
  const totalPaid = tranches.filter(t => t.status === 'paid').reduce((a, p) => a + p.amount, 0);

  const handleToggle = async (idx) => {
    try {
      setTogglingIdx(idx);
      await toggleTranche(booking.id, idx);
    } finally {
      setTogglingIdx(null);
    }
  };

  return (
    <div className="pl-root">
      {/* Header */}
      <div className="pl-header">
        <button className="pl-back" onClick={() => navigate('/finance')} aria-label="Back to dashboard">
          <Icon d={ICONS.back} size={16} /> Dashboard
        </button>

        <div className="pl-header__booking">
          <div>
            <h1 className="pl-header__title">{booking.clientName}</h1>
            <p className="pl-header__sub">{booking.bookingRef || booking.id} · {booking.hall} · {booking.eventDate}</p>
          </div>
          <BookingStatusBadge status={booking.status} size="lg" />
        </div>

        {/* Booking selector */}
        <select className="pl-booking-select"
          value={booking.id} onChange={(e) => selectBooking(e.target.value)}
          aria-label="Select booking">
          {bookings.map((b) => (
            <option key={b.id} value={b.id}>{b.bookingRef || b.id} — {b.clientName}</option>
          ))}
        </select>
      </div>

      {/* Summary bar */}
      <SummaryBar booking={booking} />

      {/* Installment Plan Breakdown */}
      <div className="pl-actions" style={{ marginTop: '24px' }}>
        <h2 style={{ color: '#C9A84C', fontWeight: 500, margin: 0 }}>Installment Plan Breakdown</h2>
        <p className="pl-actions__hint">Update individual tranches when clients pay directly or through WhatsApp</p>
      </div>

      <div className="pl-table-section">
        {tranches.length === 0 ? (
           <div className="pl-empty glass">
             <div className="pl-empty__icon">◎</div>
             <h3 className="pl-empty__title">No tranches found</h3>
           </div>
        ) : (
          <table className="pl-table" style={{ background: '#1c1b18', borderRadius: 8, overflow: 'hidden' }}>
            <thead>
              <tr>
                <th className="pl-table__th">Instalment Phase</th>
                <th className="pl-table__th">Due Date</th>
                <th className="pl-table__th">Amount</th>
                <th className="pl-table__th">Status</th>
                <th className="pl-table__th">Action</th>
              </tr>
            </thead>
            <tbody>
              {tranches.map((t, i) => {
                const isPaid = t.status === 'paid';
                const isOverdue = t.status === 'overdue';
                const isToggling = togglingIdx === i;
                
                return (
                  <tr key={i} className={`pl-table__row ${isPaid ? 'pl-table__row--paid' : ''}`}>
                    <td className="pl-table__td" style={{ fontWeight: 500 }}>{t.label}</td>
                    <td className="pl-table__td">
                      {new Date(t.dueDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                      {isOverdue && <span style={{ color: '#E85555', marginLeft: 8, fontSize: 12 }}>⚠ Overdue</span>}
                    </td>
                    <td className="pl-table__td fd-table__td--num">{formatINR(t.amount)}</td>
                    <td className={`pl-table__td ${isPaid ? 'fd-table__td--green' : isOverdue ? 'fd-table__td--red' : 'fd-table__td--yellow'}`} style={{ fontWeight: 600 }}>
                      {t.status.toUpperCase()}
                    </td>
                    <td className="pl-table__td">
                      <button 
                        className={`fd-action-btn ${isPaid ? 'fd-action-btn--outline' : ''}`}
                        style={{ minWidth: 120, justifyContent: 'center', borderColor: isPaid ? '#5FBF8A' : '', color: isPaid ? '#5FBF8A' : '' }}
                        onClick={() => handleToggle(i)}
                        disabled={isToggling}
                      >
                        {isToggling ? 'Wait...' : isPaid ? '✅ Undo Paid' : '⬜ Mark Paid'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

    </div>
  );
}
