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
  }, []);

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
  const totalPaid    = booking.payments.reduce((a, p) => a + p.amount, 0);
  const outstanding  = booking.totalValue - totalPaid;

  const typeMap = { 'Initial Deposit': 0, 'Mid-term Installment': 1, 'Final Settlement': 2 };
  const byType  = [0, 0, 0];
  booking.payments.forEach((p) => {
    const idx = typeMap[p.type] ?? 1;
    byType[idx] += p.amount;
  });
  const pct = (v) => booking.totalValue ? Math.round((v / booking.totalValue) * 100) : 0;

  const segments = [
    { label: 'Initial Deposit',     pct: pct(byType[0]), amount: byType[0], color: '#5B8FE8' },
    { label: 'Mid-term Installment',pct: pct(byType[1]), amount: byType[1], color: '#C9A84C' },
    { label: 'Final Settlement',    pct: pct(byType[2]), amount: byType[2], color: '#5FBF8A' },
  ].filter((s) => s.pct > 0);

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
            {[
              { label: 'Deposit',   color: '#5B8FE8' },
              { label: 'Mid-term',  color: '#C9A84C' },
              { label: 'Settlement',color: '#5FBF8A' },
            ].map((l) => (
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

const TYPE_COLORS = {
  'Initial Deposit':      '#5B8FE8',
  'Mid-term Installment': '#C9A84C',
  'Final Settlement':     '#5FBF8A',
};

export default function PaymentLedger() {
  const navigate  = useNavigate();
  const booking   = useFinanceStore((s) => s.getSelectedBooking());
  const bookings  = useFinanceStore((s) => s.bookings);
  const selectBooking = useFinanceStore((s) => s.selectBooking);
  const [payModal, setPayModal] = useState(false);
  const [newestId, setNewestId] = useState(null);

  useEffect(() => {
    if (booking?.payments?.length) {
      const last = booking.payments[booking.payments.length - 1];
      setNewestId(last.id);
      const t = setTimeout(() => setNewestId(null), 3000);
      return () => clearTimeout(t);
    }
  }, [booking?.payments?.length]);

  if (!booking) return (
    <div className="pl-root">
      <div className="pl-empty-select glass">
        <p className="pl-empty-select__text">Select a booking from the dashboard to view its ledger.</p>
        <button className="btn-gold" onClick={() => navigate('/finance')}><span>← Back to Dashboard</span></button>
      </div>
    </div>
  );

  const totalPaid = booking.payments.reduce((a, p) => a + p.amount, 0);
  const outstanding = booking.totalValue - totalPaid;

  // Group payments by type
  const groups = {};
  booking.payments.forEach((p) => {
    if (!groups[p.type]) groups[p.type] = [];
    groups[p.type].push(p);
  });

  return (
    <div className="pl-root">
      {/* Header */}
      <div className="pl-header">
        <button className="pl-back" onClick={() => navigate('/finance')} aria-label="Back to dashboard">
          <Icon d={ICONS.back} size={16} />
          Dashboard
        </button>

        <div className="pl-header__booking">
          <div>
            <h1 className="pl-header__title">{booking.clientName}</h1>
            <p className="pl-header__sub">{booking.id} · {booking.hall} · {booking.eventDate}</p>
          </div>
          <BookingStatusBadge status={booking.status} size="lg" />
        </div>

        {/* Booking selector */}
        <select className="pl-booking-select"
          value={booking.id} onChange={(e) => selectBooking(e.target.value)}
          aria-label="Select booking">
          {bookings.map((b) => (
            <option key={b.id} value={b.id}>{b.id} — {b.clientName}</option>
          ))}
        </select>
      </div>

      {/* Summary bar */}
      <SummaryBar booking={booking} />

      {/* Record payment */}
      <div className="pl-actions">
        <button className="btn-gold pl-record-btn" onClick={() => setPayModal(true)}>
          <Icon d={ICONS.add} size={16} />
          <span>Record Payment</span>
        </button>
        <p className="pl-actions__hint">
          {booking.payments.length} payment{booking.payments.length !== 1 ? 's' : ''} recorded
        </p>
      </div>

      {/* Ledger table */}
      {booking.payments.length === 0 ? (
        <div className="pl-empty glass">
          <div className="pl-empty__icon">◎</div>
          <h3 className="pl-empty__title">No payments recorded yet</h3>
          <p className="pl-empty__sub">Record the initial deposit to get started.</p>
        </div>
      ) : (
        <div className="pl-table-section">
          {Object.entries(groups).map(([type, payments]) => (
            <div key={type} className="pl-group">
              <div className="pl-group__header" style={{ borderColor: TYPE_COLORS[type] || '#C9A84C' }}>
                <span className="pl-group__dot" style={{ background: TYPE_COLORS[type] || '#C9A84C' }} />
                <span className="pl-group__label">{type}</span>
                <span className="pl-group__total">
                  {formatINR(payments.reduce((a, p) => a + p.amount, 0))}
                </span>
              </div>
              <table className="pl-table">
                <thead>
                  <tr>
                    {['Date', 'Amount', 'UTR Reference', 'Mode', 'Recorded By'].map(h => (
                      <th key={h} className="pl-table__th">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p.id}
                      className={`pl-table__row ${newestId === p.id ? 'pl-table__row--new' : ''} animate-fade-up`}>
                      <td className="pl-table__td">{p.date}</td>
                      <td className="pl-table__td pl-table__td--amount">{formatINR(p.amount)}</td>
                      <td className="pl-table__td pl-table__td--utr">
                        <code className="pl-utr">{p.utr}</code>
                      </td>
                      <td className="pl-table__td">
                        <span className="pl-mode">{p.mode}</span>
                      </td>
                      <td className="pl-table__td">
                        <span className="pl-recorder">
                          <Icon d={ICONS.user} size={12} /> {p.recordedBy}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          {/* Footer total */}
          <div className="pl-footer-total glass">
            <span>Running total received</span>
            <span className="pl-footer-total__val pl-footer-total__val--green">{formatINR(totalPaid)}</span>
            <span className="pl-footer-total__sep" />
            <span>Outstanding</span>
            <span className={`pl-footer-total__val ${outstanding > 0 ? 'pl-footer-total__val--red' : 'pl-footer-total__val--green'}`}>
              {outstanding > 0 ? formatINR(outstanding) : '—'}
            </span>
          </div>
        </div>
      )}

      {payModal && (
        <PaymentEntryModal bookingId={booking.id}
          onClose={() => setPayModal(false)} onSaved={() => setPayModal(false)} />
      )}
    </div>
  );
}
