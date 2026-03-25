import { create } from 'zustand';

// ── Seed data ──────────────────────────────────────────────────────────────
const SEED_BOOKINGS = [
  {
    id: 'BK-2026-001', clientName: 'Mehta Wedding', clientPhone: '+91-98765-43210',
    eventDate: '2026-04-12', hall: 'Grand Ballroom', shift: 'Evening',
    totalValue: 450000, pax: 350,
    status: 'confirmed',
    payments: [
      { id: 'P1', trancheId: 'T1', type: 'Initial Deposit', amount: 112500, utr: 'HDFC202601121', mode: 'NEFT', date: '2026-03-01', recordedBy: 'Ananya S.' },
      { id: 'P2', trancheId: 'T2', type: 'Mid-term',        amount: 100000, utr: 'ICICI20260315', mode: 'UPI',  date: '2026-03-15', recordedBy: 'Ananya S.' },
    ],
    installmentPlan: {
      template: 'standard',
      tranches: [
        { id: 'T1', label: '25% Deposit',    pct: 25, dueDate: '2026-03-01', amount: 112500 },
        { id: 'T2', label: '15% Mid-term',   pct: 15, dueDate: '2026-03-15', amount:  67500 },
        { id: 'T3', label: '35% Pre-event',  pct: 35, dueDate: '2026-04-05', amount: 157500 },
        { id: 'T4', label: '25% Post-event', pct: 25, dueDate: '2026-04-15', amount: 112500 },
      ],
    },
    gstRate: 18, isInterstate: false,
    invoiceNo: 'INV-2026-001',
  },
  {
    id: 'BK-2026-002', clientName: 'Sharma Birthday', clientPhone: '+91-91234-56789',
    eventDate: '2026-04-20', hall: 'Crystal Hall', shift: 'Afternoon',
    totalValue: 180000, pax: 120,
    status: 'temporary',
    payments: [],
    installmentPlan: { template: 'standard', tranches: [
      { id: 'T1', label: '25% Deposit',    pct: 25, dueDate: '2026-03-30', amount: 45000 },
      { id: 'T2', label: '75% Balance',    pct: 75, dueDate: '2026-04-18', amount: 135000 },
    ]},
    gstRate: 18, isInterstate: false, invoiceNo: 'INV-2026-002',
  },
  {
    id: 'BK-2026-003', clientName: 'Iyer Corp Event', clientPhone: '+91-80001-23456',
    eventDate: '2026-04-08', hall: 'Pearl Suite', shift: 'Morning',
    totalValue: 320000, pax: 200,
    status: 'overdue',
    payments: [
      { id: 'P1', trancheId: 'T1', type: 'Initial Deposit', amount: 80000, utr: 'SBI202602011', mode: 'RTGS', date: '2026-02-01', recordedBy: 'Ananya S.' },
    ],
    installmentPlan: { template: 'standard', tranches: [
      { id: 'T1', label: '25% Deposit',    pct: 25, dueDate: '2026-02-01', amount: 80000 },
      { id: 'T2', label: '75% Balance',    pct: 75, dueDate: '2026-03-20', amount: 240000 },
    ]},
    gstRate: 12, isInterstate: false, invoiceNo: 'INV-2026-003',
  },
  {
    id: 'BK-2026-004', clientName: 'Kapoor Reception', clientPhone: '+91-77777-88888',
    eventDate: '2026-03-31', hall: 'Grand Ballroom', shift: 'Evening',
    totalValue: 600000, pax: 500,
    status: 'settled',
    payments: [
      { id: 'P1', trancheId: 'T1', type: 'Initial Deposit', amount: 150000, utr: 'AXIS202601201', mode: 'NEFT', date: '2026-01-20', recordedBy: 'Ananya S.' },
      { id: 'P2', trancheId: 'T2', type: 'Mid-term',        amount: 200000, utr: 'AXIS202602101', mode: 'RTGS', date: '2026-02-10', recordedBy: 'Ananya S.' },
      { id: 'P3', trancheId: 'T3', type: 'Final Settlement', amount: 250000, utr: 'AXIS202603251', mode: 'NEFT', date: '2026-03-25', recordedBy: 'Ananya S.' },
    ],
    installmentPlan: { template: 'standard', tranches: [
      { id: 'T1', label: '25% Deposit',    pct: 25, dueDate: '2026-01-20', amount: 150000 },
      { id: 'T2', label: '33% Mid-term',   pct: 33, dueDate: '2026-02-10', amount: 198000 },
      { id: 'T3', label: '42% Settlement', pct: 42, dueDate: '2026-03-25', amount: 252000 },
    ]},
    gstRate: 18, isInterstate: false, invoiceNo: 'INV-2026-004',
  },
  {
    id: 'BK-2026-005', clientName: 'Patel Anniversary', clientPhone: '+91-99001-12345',
    eventDate: '2026-05-05', hall: 'Crystal Hall', shift: 'Evening',
    totalValue: 250000, pax: 180,
    status: 'deposit',
    payments: [
      { id: 'P1', trancheId: 'T1', type: 'Initial Deposit', amount: 62500, utr: 'HDFC202603101', mode: 'UPI', date: '2026-03-10', recordedBy: 'Ananya S.' },
    ],
    installmentPlan: { template: 'standard', tranches: [
      { id: 'T1', label: '25% Deposit',    pct: 25, dueDate: '2026-03-10', amount: 62500 },
      { id: 'T2', label: '75% Balance',    pct: 75, dueDate: '2026-04-28', amount: 187500 },
    ]},
    gstRate: 18, isInterstate: false, invoiceNo: 'INV-2026-005',
  },
];

// ── Audit log ──────────────────────────────────────────────────────────────
const mkLog = (action, actor, prev, next, meta = {}) => ({
  id: `LOG-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  action, actor, timestamp: new Date().toISOString(),
  previousState: prev, newState: next, ...meta,
});

// ── Store ──────────────────────────────────────────────────────────────────
const useFinanceStore = create((set, get) => ({
  bookings: SEED_BOOKINGS,
  selectedBookingId: SEED_BOOKINGS[0].id,
  auditLog: [],
  reminderSettings: { enabled: true },

  // ── Selectors ──
  getBooking: (id) => get().bookings.find((b) => b.id === (id ?? get().selectedBookingId)),
  getSelectedBooking: () => get().getBooking(get().selectedBookingId),

  // ── Actions ──

  selectBooking: (id) => set({ selectedBookingId: id }),

  /** RECORD_PAYMENT */
  recordPayment: (bookingId, payment) => {
    const p = { id: `P-${Date.now()}`, ...payment, recordedBy: 'Ananya S.' };
    set((s) => {
      const bookings = s.bookings.map((b) => {
        if (b.id !== bookingId) return b;
        const newPayments = [...b.payments, p];
        const totalPaid = newPayments.reduce((a, x) => a + x.amount, 0);
        const newStatus = b.status === 'temporary' && totalPaid >= b.totalValue * 0.25
          ? 'deposit' : b.status;
        return { ...b, payments: newPayments, status: newStatus };
      });
      return {
        bookings,
        auditLog: [mkLog('RECORD_PAYMENT', 'Ananya S.', null, p, { bookingId }), ...s.auditLog],
      };
    });
  },

  /** CONFIRM_BOOKING */
  confirmBooking: (bookingId) => {
    set((s) => {
      const prev = s.bookings.find((b) => b.id === bookingId)?.status;
      const bookings = s.bookings.map((b) =>
        b.id === bookingId ? { ...b, status: 'confirmed', confirmedAt: new Date().toISOString() } : b
      );
      return {
        bookings,
        auditLog: [mkLog('CONFIRM_BOOKING', 'Ananya S.', prev, 'confirmed', { bookingId }), ...s.auditLog],
      };
    });
  },

  /** ADD_INSTALLMENT */
  addInstallment: (bookingId, tranche) => {
    const t = { id: `T-${Date.now()}`, ...tranche };
    set((s) => {
      const bookings = s.bookings.map((b) =>
        b.id === bookingId
          ? { ...b, installmentPlan: { ...b.installmentPlan, tranches: [...b.installmentPlan.tranches, t] } }
          : b
      );
      return {
        bookings,
        auditLog: [mkLog('ADD_INSTALLMENT', 'Ananya S.', null, t, { bookingId }), ...s.auditLog],
      };
    });
  },

  /** UPDATE_INSTALLMENT_PLAN */
  updateInstallmentPlan: (bookingId, plan) => {
    set((s) => {
      const bookings = s.bookings.map((b) =>
        b.id === bookingId ? { ...b, installmentPlan: plan } : b
      );
      return {
        bookings,
        auditLog: [mkLog('UPDATE_INSTALLMENT_PLAN', 'Ananya S.', null, plan, { bookingId }), ...s.auditLog],
      };
    });
  },

  /** SEND_REMINDER */
  sendReminder: (bookingId, reminderKey) => {
    set((s) => ({
      auditLog: [mkLog('SEND_REMINDER', 'System', null, reminderKey, { bookingId }), ...s.auditLog],
    }));
  },

  toggleReminderEnabled: () =>
    set((s) => ({ reminderSettings: { ...s.reminderSettings, enabled: !s.reminderSettings.enabled } })),
}));

export default useFinanceStore;
