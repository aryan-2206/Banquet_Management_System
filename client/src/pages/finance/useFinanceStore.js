import { create } from 'zustand';
import api from '../../utils/api';

const mkLog = (action, actor, prev, next, meta = {}) => ({
  id: `LOG-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  action, actor, timestamp: new Date().toISOString(),
  previousState: prev, newState: next, ...meta,
});

const useFinanceStore = create((set, get) => ({
  bookings: [], // This will hold Payment objects from backend
  selectedBookingId: null,
  auditLog: [],
  reminderSettings: { enabled: true },
  loading: false,

  // ── Selectors ──
  getBooking: (id) => get().bookings.find((b) => b.id === (id ?? get().selectedBookingId)),
  getSelectedBooking: () => get().getBooking(get().selectedBookingId),

  // ── Actions ──
  fetchPayments: async (statusFilter = '') => {
    set({ loading: true });
    try {
      const res = await api.getPayments(statusFilter);
      // Map _id to id for seamless UI usage
      const formatted = (res.payments || []).map(p => ({
        ...p,
        id: p._id,
        eventDate: new Date(p.eventDate).toLocaleDateString('en-IN'),
        hall: p.hall.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      }));
      set({ bookings: formatted, loading: false });
    } catch (err) {
      console.error('Failed to fetch payments:', err);
      set({ loading: false });
    }
  },

  selectBooking: (id) => set({ selectedBookingId: id }),

  /** RECORD_PAYMENT */
  recordPayment: async (bookingId, paymentData) => {
    try {
      // paymentData expects { amount, type, mode, date, utr, trancheId, notes }
      const res = await api.recordPayment(bookingId, paymentData);
      if (res.success && res.payment) {
        set((s) => {
          const formatted = { 
            ...res.payment, 
            id: res.payment._id,
            eventDate: new Date(res.payment.eventDate).toLocaleDateString('en-IN'),
            hall: res.payment.hall.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          };
          const updatedBookings = s.bookings.map(b => b.id === bookingId ? formatted : b);
          return {
            bookings: updatedBookings,
            auditLog: [mkLog('RECORD_PAYMENT', 'Finance Manager', null, paymentData, { bookingId }), ...s.auditLog],
          };
        });
      }
    } catch (err) {
      console.error('Record payment failed:', err);
      throw err;
    }
  },

  /** CONFIRM_BOOKING */
  confirmBooking: async (bookingId) => {
    try {
      const res = await api.confirmBooking(bookingId);
      if (res.success && res.payment) {
        set((s) => {
          const prevStatus = s.bookings.find(b => b.id === bookingId)?.status;
          const formatted = { 
            ...res.payment, 
            id: res.payment._id,
            eventDate: new Date(res.payment.eventDate).toLocaleDateString('en-IN'),
            hall: res.payment.hall.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          };
          const updatedBookings = s.bookings.map(b => b.id === bookingId ? formatted : b);
          return {
            bookings: updatedBookings,
            auditLog: [mkLog('CONFIRM_BOOKING', 'Finance Manager', prevStatus, 'confirmed', { bookingId }), ...s.auditLog],
          };
        });
      }
    } catch (err) {
      console.error('Confirm booking failed:', err);
      throw err;
    }
  },

  /** UPDATE_INSTALLMENT_PLAN */
  updateInstallmentPlan: async (bookingId, plan) => {
    try {
      const res = await api.updateInstallmentPlan(bookingId, plan);
      if (res.success && res.payment) {
        set((s) => {
          const formatted = { 
            ...res.payment, 
            id: res.payment._id,
            eventDate: new Date(res.payment.eventDate).toLocaleDateString('en-IN'),
            hall: res.payment.hall.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          };
          const updatedBookings = s.bookings.map(b => b.id === bookingId ? formatted : b);
          return {
            bookings: updatedBookings,
            auditLog: [mkLog('UPDATE_INSTALLMENT_PLAN', 'Finance Manager', null, plan, { bookingId }), ...s.auditLog],
          };
        });
      }
    } catch (err) {
      console.error('Update installment plan failed:', err);
      throw err;
    }
  },

  /** ADD_INSTALLMENT - handled locally until saved */
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
        auditLog: [mkLog('ADD_INSTALLMENT', 'Finance Manager', null, t, { bookingId }), ...s.auditLog],
      };
    });
  },

  sendReminder: (bookingId, reminderKey) => {
    // Wrap to an api.sendWhatsapp call here later if needed
    set((s) => ({
      auditLog: [mkLog('SEND_REMINDER', 'System', null, reminderKey, { bookingId }), ...s.auditLog],
    }));
  },

  toggleReminderEnabled: () =>
    set((s) => ({ reminderSettings: { ...s.reminderSettings, enabled: !s.reminderSettings.enabled } })),
}));

export default useFinanceStore;
