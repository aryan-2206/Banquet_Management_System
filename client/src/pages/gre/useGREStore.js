import { create } from 'zustand';
import { io as socketIO } from 'socket.io-client';

/* ─── device id (persisted) ─── */
const DEVICE_ID =
  localStorage.getItem('gre_device_id') ||
  (() => { const id = crypto.randomUUID(); localStorage.setItem('gre_device_id', id); return id; })();

/* ─── offline queue persistence ─── */
function loadOfflineQueue() {
  try { return JSON.parse(localStorage.getItem('gre_offline_queue') || '[]'); } catch { return []; }
}
function persistOfflineQueue(q) {
  localStorage.setItem('gre_offline_queue', JSON.stringify(q));
}

/* ─── DEMO DATA ─── */
function generateDemoGuests() {
  const names = [
    'Aarav Sharma','Priya Patel','Rohan Gupta','Ananya Singh','Vikram Mehta',
    'Neha Reddy','Arjun Nair','Kavya Joshi','Siddharth Das','Ishita Verma',
    'Rahul Kapoor','Tanvi Desai','Aditya Rao','Meera Iyer','Karan Malhotra',
    'Riya Bhat','Dhruv Choudhury','Pooja Sinha','Varun Tiwari','Shreya Menon',
    'Manish Kumar','Divya Shah','Nikhil Pandey','Swati Agarwal','Amit Saxena',
    'Ritika Ghosh','Suresh Nayak','Deepa Kulkarni','Rajesh Shetty','Pallavi Dutta',
  ];
  const tables = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10'];
  const diets = [null, null, null, null, null, 'Nut allergy', 'Vegetarian only', 'Gluten free', 'Lactose intolerant', null];
  const guests = new Map();
  names.forEach((name, i) => {
    const id = `guest_${String(i + 1).padStart(3, '0')}`;
    guests.set(id, {
      id,
      name,
      phone: `+91 98${String(Math.floor(Math.random() * 100000000)).padStart(8, '0')}`,
      bookingRef: `BK-${String(2024000 + i)}`,
      table: tables[i % tables.length],
      seat: `${tables[i % tables.length]}-${(i % 4) + 1}`,
      isVIP: i < 4,
      dietaryFlag: diets[i % diets.length],
      isWalkIn: false,
      checkedInAt: null,
      checkedInBy: null,
      checkedInByName: null,
      hall: 'Hall A',
      eventId: 'evt_001',
    });
  });
  return guests;
}

const useGREStore = create((set, get) => ({
  /* ── session ── */
  session: null, // { staffId, staffName, initials, role, eventPin, loginAt, expiresAt }

  /* ── event ── */
  currentEvent: {
    id: 'evt_001',
    name: 'Sharma Wedding',
    hall: 'Hall A',
    expectedCount: 30,
    eventDate: new Date().toISOString().slice(0, 10),
    eventStartTime: new Date(Date.now() - 3600000).toISOString(),
  },

  /* ── guests (Map for O(1) lookup) ── */
  guests: generateDemoGuests(),

  /* ── checked-in (Set for O(1) duplicate detection) ── */
  checkedIn: new Set(),

  /* ── walk-ins ── */
  walkIns: [],
  walkInLimit: 10,

  /* ── scan history (last 50 scans) ── */
  scanHistory: [],

  /* ── offline queue (persisted to localStorage) ── */
  offlineQueue: loadOfflineQueue(),

  /* ── kitchen push log ── */
  kitchenPushLog: [],
  lastPushedCount: 0,
  headcountFrozen: false,
  frozenAt: null,
  frozenCount: null,

  /* ── PO & FP status ── */
  poStatus: { version: 1, sentAt: null, acknowledgedAt: null, status: 'Draft' },
  fpStatus: {
    departments: new Map([
      ['Kitchen', { acknowledged: false, acknowledgedAt: null, acknowledgedBy: null }],
      ['Décor', { acknowledged: true, acknowledgedAt: new Date(Date.now() - 1080000).toISOString(), acknowledgedBy: 'Rajesh' }],
      ['AV Team', { acknowledged: false, acknowledgedAt: null, acknowledgedBy: null }],
      ['Bar', { acknowledged: false, acknowledgedAt: null, acknowledgedBy: null }],
    ]),
  },

  /* ── alerts ── */
  alerts: [],

  /* ── audit log ── */
  auditLog: [],

  /* ── connectivity ── */
  isOnline: navigator.onLine,

  /* ── accessibility ── */
  highContrast: false,
  textSizeOffset: parseInt(localStorage.getItem('gre_text_size') || '0'),
  soundEnabled: false,

  /* ── arrival velocity tracking ── */
  arrivalTimestamps: [], // timestamps of last arrivals for velocity calc

  /* ──────────── ACTIONS ──────────── */

  setSession: (session) => set({ session }),
  clearSession: () => {
    sessionStorage.removeItem('gre_session');
    set({ session: null });
  },

  setOnline: (status) => set({ isOnline: status }),

  toggleHighContrast: () => set(s => ({ highContrast: !s.highContrast })),
  adjustTextSize: (delta) => {
    const newSize = Math.max(-2, Math.min(4, get().textSizeOffset + delta));
    localStorage.setItem('gre_text_size', String(newSize));
    set({ textSizeOffset: newSize });
  },
  toggleSound: () => set(s => ({ soundEnabled: !s.soundEnabled })),

  /* ── check-in ── */
  checkInGuest: (guestId, staffId, staffName) => {
    const state = get();
    const guest = state.guests.get(guestId);
    if (!guest) return { status: 'unknown' };
    if (state.checkedIn.has(guestId)) {
      const scanEvent = {
        id: crypto.randomUUID(),
        guestId, guestName: guest.name, type: 'duplicate',
        timestamp: new Date().toISOString(), staffId, staffName,
        originalCheckinTime: guest.checkedInAt, originalCheckinBy: guest.checkedInByName,
      };
      set(s => ({
        scanHistory: [scanEvent, ...s.scanHistory].slice(0, 50),
      }));
      get().addAuditEntry('duplicate_scan', staffId, staffName, { guestId, guestName: guest.name });
      return { status: 'duplicate', guest, scanEvent };
    }
    if (guest.hall !== state.currentEvent.hall) {
      return { status: 'blocked', guest, reason: `This QR is for ${guest.hall} — you are checking in ${state.currentEvent.hall}` };
    }
    
    // Enforce Event Capacity bounds
    if (state.checkedIn.size >= state.currentEvent.expectedCount) {
      return { status: 'blocked', guest, reason: `Maximum event capacity (${state.currentEvent.expectedCount}) reached.` };
    }

    const now = new Date().toISOString();
    const newGuests = new Map(state.guests);
    newGuests.set(guestId, { ...guest, checkedInAt: now, checkedInBy: staffId, checkedInByName: staffName });
    const newCheckedIn = new Set(state.checkedIn);
    newCheckedIn.add(guestId);

    const scanEvent = {
      id: crypto.randomUUID(),
      guestId, guestName: guest.name, type: 'success',
      timestamp: now, staffId, staffName,
      table: guest.table, seat: guest.seat, dietaryFlag: guest.dietaryFlag,
    };
    const newArrivals = [...state.arrivalTimestamps, Date.now()];

    set({
      guests: newGuests,
      checkedIn: newCheckedIn,
      scanHistory: [scanEvent, ...state.scanHistory].slice(0, 50),
      arrivalTimestamps: newArrivals,
    });
    get().addAuditEntry('check_in', staffId, staffName, { guestId, guestName: guest.name, table: guest.table });
    get().checkAutoThresholds();
    return { status: 'success', guest: newGuests.get(guestId), scanEvent };
  },

  /* ── undo check-in (60s window) ── */
  undoCheckIn: (guestId, staffId, staffName) => {
    const state = get();
    const guest = state.guests.get(guestId);
    if (!guest || !state.checkedIn.has(guestId)) return false;

    const newGuests = new Map(state.guests);
    newGuests.set(guestId, { ...guest, checkedInAt: null, checkedInBy: null, checkedInByName: null });
    const newCheckedIn = new Set(state.checkedIn);
    newCheckedIn.delete(guestId);

    set({ guests: newGuests, checkedIn: newCheckedIn });
    get().addAuditEntry('undo_check_in', staffId, staffName, { guestId, guestName: guest.name });
    return true;
  },

  /* ── walk-in ── */
  addWalkIn: (walkInData, staffId, staffName) => {
    const state = get();
    const count = parseInt(walkInData.guestCount) || 1;

    // Check strict event capacity limit
    if (state.checkedIn.size + count > state.currentEvent.expectedCount) {
      const remaining = Math.max(0, state.currentEvent.expectedCount - state.checkedIn.size);
      return { ok: false, reason: `Exceeds max capacity. Only ${remaining} space(s) remain.` };
    }

    // Walk-in pseudo-limit check
    if (state.walkIns.length + count > state.walkInLimit) {
      return { ok: false, reason: 'Walk-in overall limit reached' };
    }

    const newGuests = new Map(state.guests);
    const newCheckedIn = new Set(state.checkedIn);
    const newWalkIns = [...state.walkIns];
    const newArrivals = [...state.arrivalTimestamps];
    let leadGuest = null;

    for (let i = 0; i < count; i++) {
      const id = `walkin_${Date.now()}_${i}`;
      const displayedName = count > 1 && i > 0 ? `${walkInData.name} (+${i})` : walkInData.name;
      
      const guest = {
        id, name: displayedName, phone: walkInData.phone || '',
        bookingRef: `WI-${Date.now().toString(36).toUpperCase()}`,
        table: walkInData.table || 'Unassigned', seat: walkInData.seat || '',
        isVIP: false, dietaryFlag: walkInData.dietaryFlag || null,
        isWalkIn: true, checkedInAt: new Date().toISOString(),
        checkedInBy: staffId, checkedInByName: staffName,
        hall: state.currentEvent.hall, eventId: state.currentEvent.id,
      };

      if (i === 0) leadGuest = guest;
      
      newGuests.set(id, guest);
      newCheckedIn.add(id);
      newWalkIns.push(guest);
      newArrivals.push(Date.now());
    }

    set(s => ({
      guests: newGuests,
      checkedIn: newCheckedIn,
      walkIns: newWalkIns,
      arrivalTimestamps: newArrivals,
    }));
    
    get().addAuditEntry('add_walk_in', staffId, staffName, { guestName: walkInData.name, partySize: count });
    get().checkAutoThresholds();
    return { ok: true, guest: leadGuest };
  },

  /* ── kitchen push ── */
  pushToKitchen: (staffId, staffName) => {
    const state = get();
    if (state.headcountFrozen) return false;
    const count = state.checkedIn.size;
    const pushEvent = {
      id: crypto.randomUUID(),
      count, timestamp: new Date().toISOString(),
      staffId, staffName, acknowledged: false, acknowledgedAt: null,
      isAuto: false, triggerReason: 'Manual push',
    };
    set(s => ({
      kitchenPushLog: [pushEvent, ...s.kitchenPushLog],
      lastPushedCount: count,
    }));

    // 🔌 Emit to /kitchen socket namespace (real-time sync)
    try {
      const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5001';
      // Reuse existing connection or create one for push
      const kitchenSocket = socketIO(`${SOCKET_URL}/kitchen`, { transports: ['websocket'] });
      kitchenSocket.emit('checkin:update', {
        bookingId: state.currentEvent.id,
        arrived:   count,
        expected:  state.currentEvent.expectedCount,
      });
      setTimeout(() => kitchenSocket.disconnect(), 3000);
    } catch (_) { /* no socket available in demo mode */ }

    // Simulate kitchen acknowledgment after 3-8 seconds (local fallback)
    setTimeout(() => {
      set(s => ({
        kitchenPushLog: s.kitchenPushLog.map(p =>
          p.id === pushEvent.id ? { ...p, acknowledged: true, acknowledgedAt: new Date().toISOString() } : p
        ),
      }));
    }, 3000 + Math.random() * 5000);

    get().addAuditEntry('kitchen_push', staffId, staffName, { count });
    return true;
  },

  freezeHeadcount: (staffId, staffName) => {
    const count = get().checkedIn.size;
    set({ headcountFrozen: true, frozenAt: new Date().toISOString(), frozenCount: count });
    get().addAuditEntry('freeze_headcount', staffId, staffName, { count });
  },

  /* ── auto-threshold pushes ── */
  checkAutoThresholds: () => {
    const state = get();
    if (state.headcountFrozen) return;
    const pct = (state.checkedIn.size / state.currentEvent.expectedCount) * 100;
    const thresholds = [30, 50, 70, 90];
    const lastPct = (state.lastPushedCount / state.currentEvent.expectedCount) * 100;
    for (const t of thresholds) {
      if (pct >= t && lastPct < t) {
        const pushEvent = {
          id: crypto.randomUUID(),
          count: state.checkedIn.size, timestamp: new Date().toISOString(),
          staffId: 'system', staffName: 'Auto-Push', acknowledged: false,
          isAuto: true, triggerReason: `${t}% threshold reached`,
        };
        set(s => ({
          kitchenPushLog: [pushEvent, ...s.kitchenPushLog],
          lastPushedCount: state.checkedIn.size,
        }));
        setTimeout(() => {
          set(s => ({
            kitchenPushLog: s.kitchenPushLog.map(p =>
              p.id === pushEvent.id ? { ...p, acknowledged: true, acknowledgedAt: new Date().toISOString() } : p
            ),
          }));
        }, 4000 + Math.random() * 6000);
        break;
      }
    }
  },

  /* ── offline queue ── */
  addToOfflineQueue: (scanData) => {
    set(s => {
      const q = [...s.offlineQueue, { ...scanData, id: crypto.randomUUID(), queuedAt: new Date().toISOString() }];
      persistOfflineQueue(q);
      return { offlineQueue: q };
    });
  },
  syncOfflineQueue: () => {
    const state = get();
    const queue = [...state.offlineQueue];
    // Process each queued scan
    queue.forEach(item => {
      if (item.type === 'checkin') {
        get().checkInGuest(item.guestId, item.staffId, item.staffName);
      }
    });
    persistOfflineQueue([]);
    set({ offlineQueue: [] });
    return queue.length;
  },

  /* ── PO / FP actions ── */
  sendPO: (staffId, staffName) => {
    set(s => ({
      poStatus: { ...s.poStatus, sentAt: new Date().toISOString(), status: 'Sent', version: s.poStatus.version },
    }));
    get().addAuditEntry('send_po', staffId, staffName, { version: get().poStatus.version });
    // Simulate client acknowledgment
    setTimeout(() => {
      set(s => ({
        poStatus: { ...s.poStatus, acknowledgedAt: new Date().toISOString(), status: 'Acknowledged' },
      }));
    }, 8000 + Math.random() * 12000);
  },

  resendFP: (staffId, staffName) => {
    get().addAuditEntry('resend_fp', staffId, staffName, {});
  },

  /* ── alerts ── */
  addAlert: (alert) => {
    set(s => ({ alerts: [...s.alerts, { id: crypto.randomUUID(), timestamp: new Date().toISOString(), ...alert }] }));
  },
  dismissAlert: (id) => {
    set(s => ({ alerts: s.alerts.filter(a => a.id !== id) }));
  },

  /* ── audit log ── */
  addAuditEntry: (action, actorId, actorName, payload) => {
    const entry = {
      id: crypto.randomUUID(),
      eventId: get().currentEvent.id,
      action, actorId, actorName,
      timestamp: new Date().toISOString(),
      payload, deviceId: DEVICE_ID,
    };
    set(s => ({ auditLog: [entry, ...s.auditLog] }));
  },

  /* ── computed helpers ── */
  getArrivalVelocity: () => {
    const now = Date.now();
    const tenMinAgo = now - 600000;
    return get().arrivalTimestamps.filter(t => t > tenMinAgo).length;
  },

  getAlerts: () => {
    const state = get();
    const alerts = [];
    // Duplicate scan attempts
    const dupes = state.scanHistory.filter(s => s.type === 'duplicate').length;
    if (dupes > 0) alerts.push({ type: 'error', text: `${dupes} duplicate QR attempt${dupes > 1 ? 's' : ''}` });
    // Walk-in limit
    if (state.walkIns.length >= state.walkInLimit) alerts.push({ type: 'warning', text: `Walk-in limit reached (${state.walkInLimit})` });
    // Kitchen unack
    const unack = state.kitchenPushLog.find(p => !p.acknowledged && (Date.now() - new Date(p.timestamp).getTime()) > 480000);
    if (unack) alerts.push({ type: 'warning', text: `Kitchen not acknowledged (${Math.floor((Date.now() - new Date(unack.timestamp).getTime()) / 60000)} min)` });
    // VIP not arrived
    const vipPending = Array.from(state.guests.values()).filter(g => g.isVIP && !state.checkedIn.has(g.id));
    if (vipPending.length > 0) alerts.push({ type: 'info', text: `${vipPending.length} VIP guest${vipPending.length > 1 ? 's' : ''} not yet arrived` });
    return alerts;
  },
}));

export default useGREStore;
