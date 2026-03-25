import React, { useState } from 'react';
import useFinanceStore from './useFinanceStore';
import { meetsDepositThreshold } from './useInstallmentLogic';

function GateTooltip({ conditions }) {
  const unmet = conditions.filter((c) => !c.met);
  if (!unmet.length) return null;
  return (
    <div className="bst-tooltip">
      <p className="bst-tooltip__title">🔒 Cannot confirm yet:</p>
      <ul className="bst-tooltip__list">
        {unmet.map((c) => (
          <li key={c.label} className="bst-tooltip__item">
            <span className="bst-tooltip__x">✕</span> {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ConfirmDialog({ booking, onConfirm, onCancel }) {
  return (
    <div className="bst-dialog-overlay">
      <div className="bst-dialog glass animate-scale-in">
        <div className="bst-dialog__icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#5FBF8A" strokeWidth="1.8" strokeLinecap="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          </svg>
        </div>
        <h3 className="bst-dialog__title">Confirm Booking</h3>
        <p className="bst-dialog__body">
          You are confirming <strong>{booking.clientName}</strong> for{' '}
          <strong>{booking.eventDate}</strong>. This will notify the client,
          lock the slot, and release kitchen planning details.
        </p>
        <p className="bst-dialog__sub">This action cannot be undone.</p>
        <div className="bst-dialog__actions">
          <button className="btn-outline-gold bst-dialog__cancel" onClick={onCancel}>
            Cancel
          </button>
          <button className="bst-dialog__confirm" onClick={onConfirm}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            Confirm Booking
          </button>
        </div>
      </div>
    </div>
  );
}

export default function BookingStatusToggle({ bookingId }) {
  const booking = useFinanceStore((s) => s.bookings.find((b) => b.id === bookingId));
  const confirmBooking = useFinanceStore((s) => s.confirmBooking);
  const [showTooltip, setShowTooltip] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [confirming, setConfirming] = useState(false);

  if (!booking) return null;

  const totalPaid = booking.payments.reduce((a, p) => a + p.amount, 0);
  const hasValidUTR = booking.payments.some((p) => p.utr && p.utr.length >= 12);
  const depositOk   = meetsDepositThreshold(totalPaid, booking.totalValue);
  const isConfirmed = booking.status === 'confirmed' || booking.status === 'settled';

  const conditions = [
    { label: 'At least one payment with a valid UTR on file', met: hasValidUTR },
    { label: 'Recorded payment ≥ 25% of total value (minimum deposit)', met: depositOk },
  ];
  const canConfirm = conditions.every((c) => c.met) && !isConfirmed;

  function handleToggleClick() {
    if (!canConfirm) { setShowTooltip(true); setTimeout(() => setShowTooltip(false), 3000); return; }
    setShowDialog(true);
  }

  async function handleConfirm() {
    setConfirming(true);
    await new Promise((r) => setTimeout(r, 400));
    confirmBooking(bookingId);
    setConfirming(false);
    setShowDialog(false);
  }

  return (
    <>
      <div className="bst-wrap" style={{ position: 'relative' }}
        onMouseLeave={() => setShowTooltip(false)}>
        {/* Toggle pill */}
        <button
          className={`bst-pill ${isConfirmed ? 'bst-pill--on' : 'bst-pill--off'} ${!canConfirm && !isConfirmed ? 'bst-pill--locked' : ''}`}
          onClick={handleToggleClick}
          aria-label={isConfirmed ? 'Booking confirmed' : 'Confirm booking'}
          aria-pressed={isConfirmed}
        >
          <span className="bst-pill__label bst-pill__label--off">Enquiry</span>
          <span className={`bst-pill__thumb ${isConfirmed ? 'bst-pill__thumb--on' : ''}`}>
            {!canConfirm && !isConfirmed && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            )}
            {isConfirmed && '✓'}
          </span>
          <span className="bst-pill__label bst-pill__label--on">Confirmed</span>
        </button>

        {/* Tooltip */}
        {showTooltip && !canConfirm && !isConfirmed && (
          <GateTooltip conditions={conditions} />
        )}
      </div>

      {/* Confirm dialog */}
      {showDialog && (
        <ConfirmDialog
          booking={booking}
          onConfirm={handleConfirm}
          onCancel={() => setShowDialog(false)}
        />
      )}
    </>
  );
}
