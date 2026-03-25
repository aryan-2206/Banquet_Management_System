// Booking state slice (Zustand)
import { create } from 'zustand';
import api from '../utils/api';

const useBookingStore = create((set, get) => ({
  bookings: [],
  loading: false,
  error: null,
  selectedBookingId: null,

  // Fetch all bookings from API
  fetchBookings: async (params = '') => {
    set({ loading: true, error: null });
    try {
      const res = await api.getBookings(params);
      set({ bookings: res.bookings || [], loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  selectBooking: (id) => set({ selectedBookingId: id }),
  getSelected: () => get().bookings.find((b) => b._id === get().selectedBookingId),

  // Create booking
  createBooking: async (formData) => {
    set({ loading: true, error: null });
    try {
      const res = await api.createBooking(formData);
      set({ loading: false });
      return res;
    } catch (err) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },
}));

export default useBookingStore;
