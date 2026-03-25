import { create } from 'zustand';
import api from '../utils/api';

const useKitchenStore = create((set, get) => ({
  events: [],
  loading: false,

  fetchEvents: async () => {
    set({ loading: true });
    try {
      const res = await api.getKitchenEvents();
      if (res.success) {
        const mapped = res.events.map((e, idx) => ({
          id: e._id,
          name: e.personalDetails?.name || 'Unnamed Event',
          hall: (e.eventDetails?.venue || '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          time: e.eventDetails?.time || 'TBD',
          pax: e.eventDetails?.guests || 0,
          arrived: 0, // Will be updated via socket later
          tier: (e.menuSelection?.customRequirements || '').includes('Elite') ? 'Elite' : (e.menuSelection?.customRequirements || '').includes('Premium') ? 'Premium' : 'Standard',
          color: idx % 2 === 0 ? "#C9A84C" : "#5B8FE8"
        }));
        set({ events: mapped, loading: false });
      } else {
        set({ loading: false });
      }
    } catch (err) {
      console.error('Kitchen store error:', err);
      set({ loading: false });
    }
  }
}));

export default useKitchenStore;
