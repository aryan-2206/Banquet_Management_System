import { create } from 'zustand';
import { io } from 'socket.io-client';
import api from '../utils/api';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';

let kitchenSocket = null;

const useKitchenStore = create((set, get) => ({
  events: [],
  loading: false,
  headcounts: {}, // { [bookingId]: { arrived, expected } }
  stockItems: [],
  stockLoading: false,

  /* ── Fetch today's events from API ── */
  fetchEvents: async () => {
    set({ loading: true });
    try {
      const res = await api.getKitchenEvents();
      if (res.success) {
        const mapped = res.events.map((e, idx) => ({
          id:      e._id,
          name:    e.personalDetails?.name || 'Unnamed Event',
          hall:    (e.eventDetails?.venue || '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          time:    e.eventDetails?.time    || 'TBD',
          pax:     e.eventDetails?.guests  || 0,
          arrived: 0, // will be updated via socket
          tier:    (e.menuSelection?.customRequirements || '').includes('Elite')
                     ? 'Elite'
                     : (e.menuSelection?.customRequirements || '').includes('Premium')
                       ? 'Premium'
                       : 'Standard',
          color: ['#C9A84C', '#5B8FE8', '#5FBF8A', '#E85E9A'][idx % 4],
        }));
        set({ events: mapped, loading: false });
      } else {
        set({ loading: false });
      }
    } catch (err) {
      console.error('Kitchen fetchEvents error:', err);
      set({ loading: false });
    }
  },

  /* ── Fetch stock from API ── */
  fetchStock: async () => {
    set({ stockLoading: true });
    try {
      const data = await api.getStock();
      // API returns array directly from stockController
      const items = Array.isArray(data) ? data : (data.items || []);
      set({ stockItems: items, stockLoading: false });
    } catch (err) {
      console.error('Kitchen fetchStock error:', err);
      set({ stockLoading: false });
    }
  },

  /* ── Connect to /kitchen socket namespace ── */
  connectSocket: () => {
    if (kitchenSocket) return; // already connected

    kitchenSocket = io(`${SOCKET_URL}/kitchen`, {
      transports: ['websocket'],
      reconnectionAttempts: 5,
    });

    kitchenSocket.on('connect', () => {
      console.log('🍳 Kitchen socket connected');
    });

    /* Full state sync on connect */
    kitchenSocket.on('headcount:sync', (state) => {
      set(s => {
        const updatedEvents = s.events.map(ev => {
          const hc = state[ev.id];
          if (hc) return { ...ev, arrived: hc.arrived };
          return ev;
        });
        return { events: updatedEvents, headcounts: state };
      });
    });

    /* Incremental update when a guest scans in */
    kitchenSocket.on('headcount:update', ({ bookingId, arrived, expected }) => {
      set(s => {
        const updatedEvents = s.events.map(ev => {
          if (ev.id === bookingId) return { ...ev, arrived, pax: expected || ev.pax };
          return ev;
        });
        return {
          events: updatedEvents,
          headcounts: { ...s.headcounts, [bookingId]: { arrived, expected } },
        };
      });
      console.log(`🍳 Kitchen headcount updated: ${bookingId} → ${arrived}/${expected}`);
    });

    kitchenSocket.on('disconnect', () => {
      console.log('🍳 Kitchen socket disconnected');
    });
  },

  /* ── Disconnect socket on cleanup ── */
  disconnectSocket: () => {
    if (kitchenSocket) {
      kitchenSocket.disconnect();
      kitchenSocket = null;
    }
  },
}));

/* ── Expose socket for GRE manual push ── */
export function getKitchenSocket() { return kitchenSocket; }

export default useKitchenStore;
