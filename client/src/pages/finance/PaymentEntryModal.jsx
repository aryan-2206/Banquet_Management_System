import React, { useState, useRef, useEffect } from 'react';
import { formatINR, isValidUTR } from './useInstallmentLogic';
import useFinanceStore from './useFinanceStore';

const MODES = ['NEFT', 'RTGS', 'UPI', 'Cash', 'Cheque'];
const TYPES = ['Initial Deposit', 'Mid-term Installment', 'Final Settlement'];

function formatIndianInput(val) {
  const raw = val.replace(/[^0-9]/g, '');
  if (!raw) return '';
  const n = parseInt(raw, 10);
  return formatINR(n).replace('₹', '');
}

export default function PaymentEntryModal({ bookingId, onClose, onSaved }) {
  const recordPayment = useFinanceStore((s) => s.recordPayment);
  const booking = useFinanceStore((s) => s.bookings.find((b) => b.id === bookingId));

  const [form, setForm] = useState({
    type: TYPES[0],
    amount: '',
    utr: '',
    mode: 'NEFT',
    date: new Date().toISOString().slice(0, 10),
    notes: '',
  });
  const [amountRaw, setAmountRaw] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved,  setSaved]  = useState(false);
  const overlayRef = useRef();

  const utrOk    = isValidUTR(form.utr);
  const amountOk = (parseInt(amountRaw, 10) || 0) > 0;
  const canSave  = utrOk && amountOk && !saving;

  function handleAmountChange(e) {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    setAmountRaw(raw);
    setForm((f) => ({ ...f, amount: parseInt(raw, 10) || 0 }));
  }

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 600)); // simulate network
    recordPayment(bookingId, { ...form, amount: parseInt(amountRaw, 10), status: 'recorded', date: form.date });
    setSaved(true);
    setTimeout(() => { onSaved?.(); onClose?.(); }, 900);
  }

  // Close on overlay click
  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) onClose?.();
  }

  // Close on Escape
  useEffect(() => {
    const handler = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  if (!booking) return null;

  return (
    <div className="pem-overlay" ref={overlayRef} onClick={handleOverlayClick} role="dialog" aria-modal aria-label="Record Payment">
      <div className="pem-modal glass animate-scale-in">
        {/* Header */}
        <div className="pem-header">
          <div>
            <p className="pem-super">Record Payment</p>
            <h2 className="pem-title">{booking.clientName}</h2>
            <p className="pem-sub">{booking.id} · {booking.eventDate}</p>
          </div>
          <button className="pem-close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        {/* Payment type */}
        <div className="pem-field">
          <label className="pem-label">Payment Type</label>
          <select className="pem-select" value={form.type}
            onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}>
            {TYPES.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>

        {/* Amount */}
        <div className="pem-field">
          <label className="pem-label">Amount</label>
          <div className="pem-input-wrap">
            <span className="pem-prefix">₹</span>
            <input className="pem-input" type="text" inputMode="numeric"
              placeholder="0"
              value={amountRaw ? Number(amountRaw).toLocaleString('en-IN') : ''}
              onChange={handleAmountChange}
              aria-label="Payment amount"
            />
          </div>
          {amountRaw && (
            <p className="pem-hint">{formatINR(parseInt(amountRaw, 10))}</p>
          )}
        </div>

        {/* UTR */}
        <div className="pem-field">
          <label className="pem-label">UTR / Transaction Reference
            <span className={`pem-utr-status ${utrOk ? 'pem-utr-status--ok' : form.utr ? 'pem-utr-status--err' : ''}`}>
              {form.utr ? (utrOk ? '✓ valid' : '✕ 12–22 alphanumeric required') : ''}
            </span>
          </label>
          <input className={`pem-input pem-input--full ${form.utr && !utrOk ? 'pem-input--err' : utrOk ? 'pem-input--ok' : ''}`}
            type="text" placeholder="e.g. HDFC202601121" maxLength={22}
            value={form.utr} onChange={(e) => setForm((f) => ({ ...f, utr: e.target.value.trim() }))}
            aria-label="UTR reference number"
          />
        </div>

        {/* Payment Mode */}
        <div className="pem-field">
          <label className="pem-label">Payment Mode</label>
          <div className="pem-seg">
            {MODES.map((m) => (
              <button key={m} className={`pem-seg-btn ${form.mode === m ? 'pem-seg-btn--active' : ''}`}
                onClick={() => setForm((f) => ({ ...f, mode: m }))}>
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Date */}
        <div className="pem-field">
          <label className="pem-label">Date of Receipt</label>
          <input className="pem-input pem-input--full" type="date" value={form.date}
            onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            aria-label="Date of receipt"
          />
        </div>

        {/* Notes */}
        <div className="pem-field">
          <label className="pem-label">Notes <span className="pem-optional">(optional)</span></label>
          <textarea className="pem-textarea" rows={2} placeholder="e.g. Advance before function prospectus"
            value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
        </div>

        {/* Footer */}
        <div className="pem-footer">
          <button className="btn-outline-gold pem-cancel" onClick={onClose}>Cancel</button>
          <button className={`btn-gold pem-save ${!canSave ? 'pem-save--disabled' : ''} ${saved ? 'pem-save--saved' : ''}`}
            onClick={handleSave} disabled={!canSave} aria-disabled={!canSave}>
            <span>
              {saved ? '✓ Saved' : saving ? 'Saving…' : 'Record Payment'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
