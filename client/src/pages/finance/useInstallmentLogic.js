// ── Pure calculation helpers — no UI, no side effects ──

/** Format a number in Indian currency style (e.g. 1,00,000) */
export function formatINR(n) {
  if (n == null) return '₹0';
  const str = Math.abs(Math.round(n)).toString();
  let result = str.slice(-3);
  let rem = str.slice(0, -3);
  while (rem.length > 0) {
    result = rem.slice(-2) + ',' + result;
    rem = rem.slice(0, -2);
  }
  return (n < 0 ? '-₹' : '₹') + result;
}

/** Validate a UTR / transaction reference (12–22 alphanumeric) */
export function isValidUTR(utr) {
  return /^[A-Za-z0-9]{12,22}$/.test((utr || '').trim());
}

/** Check if a date is overdue (before today) */
export function isOverdue(dueDateStr) {
  if (!dueDateStr) return false;
  return new Date(dueDateStr) < new Date(new Date().toDateString());
}

/** Days until due (negative = overdue) */
export function daysUntilDue(dueDateStr) {
  if (!dueDateStr) return null;
  const diff = new Date(dueDateStr) - new Date(new Date().toDateString());
  return Math.round(diff / 86400000);
}

/** Given tranches[], compute status of each installment */
export function resolveInstallmentStatus(tranches, payments) {
  return tranches.map((t) => {
    const paidForTranche = payments.find(
      (p) => p.trancheId === t.id && p.status === 'recorded'
    );
    if (paidForTranche) return { ...t, state: 'paid', paymentRef: paidForTranche };
    if (isOverdue(t.dueDate)) return { ...t, state: 'overdue' };
    if (daysUntilDue(t.dueDate) === 0) return { ...t, state: 'due_today' };
    return { ...t, state: 'upcoming' };
  });
}

/** Given total value and tranches[], validate percentage sums to 100 */
export function validateTranches(tranches) {
  const total = tranches.reduce((s, t) => s + (Number(t.pct) || 0), 0);
  return { total, valid: Math.abs(total - 100) < 0.01 };
}

/** Calculate amount for a tranche percentage */
export function trancheAmount(pct, totalValue) {
  return Math.round((pct / 100) * totalValue);
}

/** Reminder schedule for a given due date */
export function getReminderSchedule(dueDateStr) {
  const due = new Date(dueDateStr);
  const fmt = (d) => d.toISOString().slice(0, 10);
  const addDays = (d, n) => new Date(d.getTime() + n * 86400000);
  return [
    { label: 'T−7 days', date: fmt(addDays(due, -7)), key: 'T-7' },
    { label: 'T−2 days', date: fmt(addDays(due, -2)), key: 'T-2' },
    { label: 'T+1 day (overdue)',  date: fmt(addDays(due, 1)),  key: 'T+1' },
    { label: 'T+7 days (escalation)', date: fmt(addDays(due, 7)), key: 'T+7' },
  ];
}

/** Minimum deposit threshold check (default 25%) */
export function meetsDepositThreshold(totalPaid, totalValue, threshold = 0.25) {
  return totalPaid >= totalValue * threshold;
}

/** GST computation */
export function computeGST(taxableAmount, ratePercent, isInterstate = false) {
  const gst = (taxableAmount * ratePercent) / 100;
  if (isInterstate) return { igst: gst, cgst: 0, sgst: 0, total: gst };
  return { igst: 0, cgst: gst / 2, sgst: gst / 2, total: gst };
}

/** Animate a number from 0 → target over duration ms, calls onUpdate each frame */
export function animateCounter(target, duration, onUpdate, onDone) {
  const start = performance.now();
  const tick = (now) => {
    const p = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
    onUpdate(Math.round(eased * target));
    if (p < 1) requestAnimationFrame(tick);
    else onDone?.();
  };
  requestAnimationFrame(tick);
}
