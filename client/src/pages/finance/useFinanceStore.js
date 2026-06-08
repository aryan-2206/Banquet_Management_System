import { create } from 'zustand';
import api from '../../utils/api';
import { io } from 'socket.io-client';

const mkLog = (action, actor, prev, next, meta = {}) => ({
  id: `LOG-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  action, actor, timestamp: new Date().toISOString(),
  previousState: prev, newState: next, ...meta,
});

let socketInstance = null;

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

  /** TOGGLE_TRANCHE */
  toggleTranche: async (bookingId, trancheIdx) => {
    try {
      const res = await api.toggleTranche(bookingId, trancheIdx);
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
            auditLog: [mkLog('TOGGLE_TRANCHE', 'Finance Manager', null, res.payment.status, { bookingId, trancheIdx }), ...s.auditLog],
          };
        });
      }
    } catch (err) {
      console.error('Toggle tranche failed:', err);
      throw err;
    }
  },

  initSocket: () => {
    if (!socketInstance) {
      const SOCKET_URL = (import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001');
      socketInstance = io(SOCKET_URL, { transports: ['websocket'] });

      // Existing payment was updated (e.g. tranche toggled, record payment, WhatsApp confirmation)
      socketInstance.on('payment:updated', (data) => {
        console.log('Socket payment:updated', data);
        // Optimistically update the specific payment's status in the local list
        set(s => ({
          bookings: s.bookings.map(b =>
            b.id === data.bookingId || b.bookingRef === data.bookingRef
              ? { ...b, status: data.status }
              : b
          ),
          auditLog: [
            {
              id: `live-${Date.now()}`,
              action: 'PAYMENT_VIA_WHATSAPP',
              actor: data.clientName || 'Client',
              timestamp: new Date().toISOString(),
              previousState: null,
              newState: data.status,
              bookingRef: data.bookingRef,
              details: data.tranchePaid
                ? `${data.tranchePaid} (₹${(data.amountPaid || 0).toLocaleString('en-IN')}) confirmed via WhatsApp`
                : 'Payment confirmed via WhatsApp',
            },
            ...s.auditLog,
          ],
        }));
        // Full refresh after 2s to get complete data
        setTimeout(() => get().fetchPayments(), 2000);
      });

      // New booking was just created by Sales — add to Finance list in real-time
      socketInstance.on('booking:created', (data) => {
        console.log('Socket booking:created', data);
        // Optimistic prepend with temporary data until next full fetch
        set(s => ({
          bookings: [
            {
              id:         data.bookingId,
              bookingRef: data.enquiryId,
              clientName: data.clientName,
              eventDate:  data.eventDate
                ? new Date(data.eventDate).toLocaleDateString('en-IN')
                : 'TBD',
              hall:       data.hall   || 'TBD',
              totalValue: data.totalValue || 0,
              status:     data.status || 'temporary',
              installmentPlan: { tranches: [] },
              payments: [],
              _isLive: true, // flag for UI highlight
            },
            ...s.bookings,
          ],
          auditLog: [
            { id: `live-${Date.now()}`, action: 'NEW_BOOKING_LIVE', actor: 'System',
              timestamp: new Date().toISOString(), previousState: null, newState: 'temporary',
              bookingRef: data.enquiryId },
            ...s.auditLog,
          ],
        }));
        // Full refresh after 2s to get complete data
        setTimeout(() => get().fetchPayments(), 2000);
      });

      // QR batch sent — log it in audit
      socketInstance.on('qr:batch_sent', (data) => {
        console.log('Socket qr:batch_sent', data);
        set(s => ({
          auditLog: [
            {
              id: `live-${Date.now()}`,
              action: 'QR_BATCH_SENT',
              actor: 'System',
              timestamp: new Date().toISOString(),
              previousState: null,
              newState: 'qr_sent',
              bookingRef: data.enquiryId,
              details: `${data.guestCount} guest QR codes dispatched via WhatsApp`,
            },
            ...s.auditLog,
          ],
        }));
      });
    }
  },

  cleanupSocket: () => {
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
    }
  }
}));

export default useFinanceStore;
