import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useFinanceStore from './useFinanceStore';
import {
  formatINR, validateTranches, trancheAmount,
  resolveInstallmentStatus, getReminderSchedule, isOverdue, daysUntilDue,
} from './useInstallmentLogic';

const Icon = ({ d, size = 18, className = '' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d={d} />
  </svg>
);
const ICONS = {
  back:    'M19 12H5M12 5l-7 7 7 7',
  plus:    'M12 5v14M5 12h14',
  trash:   'M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2',
  check:   'M20 6 9 17l-5-5',
  alert:   'M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0zM12 9v4M12 17h.01',
  whatsapp:'M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z',
  record:  'M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6',
  eye:     'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z',
};

const TEMPLATES = [
  {
    id: 'standard',
    label: 'Standard',
    desc: '4-tranche: 25% / 15% / 35% / 25%',
    tranches: [
      { label: '25% Deposit',    pct: 25, daysBefore: 60 },
      { label: '15% Mid-term',   pct: 15, daysBefore: 30 },
      { label: '35% Pre-event',  pct: 35, daysBefore:  7 },
      { label: '25% Post-event', pct: 25, daysAfter:   7 },
    ],
  },
  {
    id: 'proximity',
    label: 'Event-Proximity',
    desc: 'Time-based: 30 days / 14 days / day-of',
    tranches: [
      { label: '30% at 30 days', pct: 30, daysBefore: 30 },
      { label: '40% at 14 days', pct: 40, daysBefore: 14 },
      { label: '30% Day-of',     pct: 30, daysBefore:  0 },
    ],
  },
  { id: 'custom', label: 'Custom', desc: 'Define your own tranches', tranches: [] },
];

function buildTranches(templateId, eventDate, totalValue) {
  const tpl = TEMPLATES.find((t) => t.id === templateId);
  if (!tpl || !tpl.tranches.length) return [];
  const evDate = new Date(eventDate);
  return tpl.tranches.map((t, i) => {
    const due = new Date(evDate);
    if (t.daysBefore != null) due.setDate(due.getDate() - t.daysBefore);
    else if (t.daysAfter != null) due.setDate(due.getDate() + t.daysAfter);
    return {
      id: `T-${i + 1}`,
      label: t.label,
      pct: t.pct,
      dueDate: due.toISOString().slice(0, 10),
      amount: trancheAmount(t.pct, totalValue),
    };
  });
}

/* ── Timeline Node ── */
function TimelineNode({ tranche, booking, onRecordPayment }) {
  const payments = booking.payments || [];
  const resolved = resolveInstallmentStatus([tranche], payments)[0];
  const days = daysUntilDue(tranche.dueDate);
  const overdue = isOverdue(tranche.dueDate);

  const stateMap = {
    paid:      { color: '#5FBF8A', icon: ICONS.check,  ring: false },
    overdue:   { color: '#E85555', icon: ICONS.alert,  ring: true  },
    due_today: { color: '#E8C455', icon: ICONS.alert,  ring: true  },
    upcoming:  { color: '#4A4840', icon: null,         ring: false },
  };
  const cfg = stateMap[resolved.state] || stateMap.upcoming;

  return (
    <div className="ib-timeline-node">
      <div className="ib-timeline-left">
        <div className={`ib-node-circle ${resolved.state === 'paid' ? 'ib-node-circle--paid' : ''} ${cfg.ring ? 'ib-node-circle--ring' : ''}`}
          style={{ borderColor: cfg.color, background: resolved.state === 'paid' || cfg.ring ? `${cfg.color}20` : 'transparent' }}>
          {cfg.icon && (
            <Icon d={cfg.icon} size={11}
              className={`ib-node-icon ${resolved.state === 'overdue' || resolved.state === 'due_today' ? 'ib-node-icon--pulse' : ''}`}
              style={{ color: cfg.color }} />
          )}
        </div>
        <div className="ib-timeline-line" />
      </div>
      <div className="ib-node-content glass">
        <div className="ib-node-top">
          <div>
            <div className="ib-node-label">{tranche.label}</div>
            <div className="ib-node-date">{tranche.dueDate}
              {days !== null && resolved.state !== 'paid' && (
                <span style={{ color: cfg.color, marginLeft: 8, fontSize: '.72rem' }}>
                  {overdue ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : `in ${days}d`}
                </span>
              )}
            </div>
          </div>
          <div className="ib-node-amount" style={{ color: cfg.color }}>
            {formatINR(tranche.amount)}
            <div className="ib-node-pct">{tranche.pct}%</div>
          </div>
        </div>

        <div className="ib-node-footer">
          <span className={`badge-finance badge-finance--${resolved.state === 'paid' ? 'settled' : resolved.state === 'overdue' ? 'overdue' : 'temporary'}`}>
            {resolved.state === 'paid' ? '✓ Paid' : resolved.state === 'overdue' ? '! Overdue' : resolved.state === 'due_today' ? 'Due Today' : 'Upcoming'}
          </span>
          {resolved.state !== 'paid' && (
            <button className="fd-action-btn" onClick={() => onRecordPayment?.(booking.id)}>
              <Icon d={ICONS.record} size={13} /> Record
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Reminder rows ── */
function RemindersPanel({ booking }) {
  const schedule = booking.installmentPlan?.tranches?.length
    ? getReminderSchedule(booking.installmentPlan.tranches[0].dueDate)
    : [];
  const reminderEnabled = useFinanceStore((s) => s.reminderSettings.enabled);
  const toggle = useFinanceStore((s) => s.toggleReminderEnabled);
  const sendReminder = useFinanceStore((s) => s.sendReminder);

  return (
    <div className="ib-reminders glass">
      <div className="ib-reminders__header">
        <div>
          <h3 className="ib-reminders__title">WhatsApp Reminders</h3>
          <p className="ib-reminders__sub">Auto-send installment reminders to {booking.clientName}</p>
        </div>
        <button className={`ib-toggle ${reminderEnabled ? 'ib-toggle--on' : ''}`} onClick={toggle}
          aria-label={`Reminders ${reminderEnabled ? 'on' : 'off'}`} aria-pressed={reminderEnabled}>
          <span className="ib-toggle__thumb" />
        </button>
      </div>
      {schedule.map((r) => (
        <div key={r.key} className="ib-reminder-row">
          <div>
            <div className="ib-reminder-label">{r.label}</div>
            <div className="ib-reminder-date">{r.date}</div>
          </div>
          <span className="badge-finance badge-finance--temporary">Scheduled</span>
          <button className="fd-action-btn" onClick={() => sendReminder(booking.id, r.key)}
            aria-label={`Preview ${r.label} message`}>
            <Icon d={ICONS.whatsapp} size={13} /> Preview
          </button>
        </div>
      ))}
    </div>
  );
}

/* ── Main ── */
export default function InstallmentBuilder() {
  const navigate = useNavigate();
  const booking  = useFinanceStore((s) => s.getSelectedBooking());
  const bookings = useFinanceStore((s) => s.bookings);
  const selectBooking = useFinanceStore((s) => s.selectBooking);
  const updatePlan    = useFinanceStore((s) => s.updateInstallmentPlan);

  const [mode, setMode] = useState('builder'); // 'builder' | 'timeline'
  const [template, setTemplate] = useState('standard');
  const [customTranches, setCustomTranches] = useState([
    { id: 'CT-1', label: 'Tranche 1', pct: 50, dueDate: '', amount: 0 },
    { id: 'CT-2', label: 'Tranche 2', pct: 50, dueDate: '', amount: 0 },
  ]);
  const [payModalId, setPayModalId] = useState(null);

  if (!booking) return (
    <div className="ib-root">
      <div className="ib-no-booking glass">
        <p>Select a booking from the dashboard first.</p>
        <button className="btn-gold" onClick={() => navigate('/finance')}><span>← Dashboard</span></button>
      </div>
    </div>
  );

  const activeTranches = template === 'custom'
    ? customTranches
    : buildTranches(template, booking.eventDate, booking.totalValue);

  const { total: pctTotal, valid: pctValid } = validateTranches(
    template === 'custom' ? customTranches : activeTranches
  );

  function addCustomTranche() {
    setCustomTranches((prev) => [
      ...prev,
      { id: `CT-${Date.now()}`, label: `Tranche ${prev.length + 1}`, pct: 0, dueDate: '', amount: 0 },
    ]);
  }
  function removeCustomTranche(id) {
    setCustomTranches((prev) => prev.filter((t) => t.id !== id));
  }
  function updateCustomTranche(id, field, value) {
    setCustomTranches((prev) => prev.map((t) => {
      if (t.id !== id) return t;
      const updated = { ...t, [field]: value };
      if (field === 'pct') updated.amount = trancheAmount(Number(value) || 0, booking.totalValue);
      return updated;
    }));
  }
  function savePlan() {
    const tranches = activeTranches.map((t, i) => ({ ...t, id: t.id || `TP-${i}` }));
    updatePlan(booking.id, { template, tranches });
  }

  return (
    <div className="ib-root">
      {/* Header */}
      <div className="ib-header">
        <button className="pl-back" onClick={() => navigate('/finance')} aria-label="Back">
          <Icon d={ICONS.back} size={16} /> Dashboard
        </button>
        <div>
          <h1 className="ib-title">Installment Plan</h1>
          <p className="ib-sub">{booking.clientName} · {booking.eventDate} · {formatINR(booking.totalValue)}</p>
        </div>
        <select className="pl-booking-select" value={booking.id}
          onChange={(e) => selectBooking(e.target.value)} aria-label="Select booking">
          {bookings.map((b) => <option key={b.id} value={b.id}>{b.id} — {b.clientName}</option>)}
        </select>
      </div>

      {/* Mode tabs */}
      <div className="ib-tabs">
        {['builder', 'timeline'].map((m) => (
          <button key={m} className={`ib-tab ${mode === m ? 'ib-tab--active' : ''}`}
            onClick={() => setMode(m)}>
            {m === 'builder' ? '✎ Builder' : '◎ Timeline'}
          </button>
        ))}
      </div>

      {mode === 'builder' ? (
        <div className="ib-builder">
          {/* Template selection */}
          <div className="ib-templates">
            {TEMPLATES.map((tpl) => (
              <button key={tpl.id}
                className={`ib-template-card glass ${template === tpl.id ? 'ib-template-card--active' : ''}`}
                onClick={() => setTemplate(tpl.id)}>
                <div className="ib-template-card__radio">
                  <span className="ib-template-card__dot" />
                </div>
                <div>
                  <div className="ib-template-card__label">{tpl.label}</div>
                  <div className="ib-template-card__desc">{tpl.desc}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Tranche list */}
          <div className="ib-tranches">
            {(template === 'custom' ? customTranches : activeTranches).map((t, i) => (
              <div key={t.id} className="ib-tranche glass animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="ib-tranche__num">{i + 1}</div>
                <input className="ib-tranche__label" value={t.label}
                  readOnly={template !== 'custom'}
                  onChange={(e) => template === 'custom' && updateCustomTranche(t.id, 'label', e.target.value)}
                  aria-label="Tranche label" />
                <div className="ib-tranche__pct-wrap">
                  <input type="range" min="0" max="100" step="1" value={t.pct}
                    readOnly={template !== 'custom'}
                    onChange={(e) => template === 'custom' && updateCustomTranche(t.id, 'pct', e.target.value)}
                    className="ib-slider" aria-label="Percentage" />
                  <span className="ib-tranche__pct">{t.pct}%</span>
                </div>
                <input type="date" className="pem-input" value={t.dueDate}
                  readOnly={template !== 'custom'}
                  onChange={(e) => template === 'custom' && updateCustomTranche(t.id, 'dueDate', e.target.value)}
                  aria-label="Due date" />
                <span className="ib-tranche__amt" style={{ color: '#5FBF8A' }}>{formatINR(t.amount || trancheAmount(t.pct, booking.totalValue))}</span>
                {template === 'custom' && (
                  <button className="ib-tranche__remove" onClick={() => removeCustomTranche(t.id)}
                    aria-label="Remove tranche">
                    <Icon d={ICONS.trash} size={14} />
                  </button>
                )}
              </div>
            ))}

            {template === 'custom' && (
              <button className="ib-add-tranche btn-outline-gold" onClick={addCustomTranche}>
                <Icon d={ICONS.plus} size={15} /> Add Tranche
              </button>
            )}

            {/* PCT total indicator */}
            <div className={`ib-pct-total ${pctValid ? 'ib-pct-total--ok' : pctTotal > 100 ? 'ib-pct-total--over' : 'ib-pct-total--under'}`}>
              Total: <strong>{pctTotal}%</strong>
              {pctValid ? ' ✓ Ready to save' : pctTotal > 100 ? ' — reduce percentages' : ` — ${100 - pctTotal}% remaining`}
            </div>
          </div>

          <button className={`btn-gold ib-save ${!pctValid ? 'pem-save--disabled' : ''}`}
            onClick={savePlan} disabled={!pctValid} aria-disabled={!pctValid}>
            <span>Save Installment Plan</span>
          </button>
        </div>
      ) : (
        /* Timeline Mode */
        <div className="ib-timeline">
          {(booking.installmentPlan?.tranches || []).length === 0 ? (
            <div className="ib-empty glass">
              <div className="fd-empty__icon">◎</div>
              <h3 className="fd-empty__title">No plan saved yet</h3>
              <p className="fd-empty__sub">Switch to Builder mode to create an installment plan.</p>
              <button className="btn-outline-gold" onClick={() => setMode('builder')}>Open Builder</button>
            </div>
          ) : (
            (booking.installmentPlan?.tranches || []).map((t) => (
              <TimelineNode key={t.id} tranche={t} booking={booking}
                onRecordPayment={setPayModalId} />
            ))
          )}
          <RemindersPanel booking={booking} />
        </div>
      )}

      {payModalId && (
        <PaymentEntryModal bookingId={payModalId}
          onClose={() => setPayModalId(null)} onSaved={() => setPayModalId(null)} />
      )}
    </div>
  );
}
