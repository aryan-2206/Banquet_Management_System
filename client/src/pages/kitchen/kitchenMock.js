// Mock kitchen data + helpers for a self-contained prototype.
// Replace with API/real-time integrations later.

export const KITCHEN_COURSES = [
  { id: "welcome", label: "Welcome Drinks" },
  { id: "starters", label: "Starters" },
  { id: "soup", label: "Soup" },
  { id: "main", label: "Main Course" },
  { id: "breads", label: "Breads" },
  { id: "rice", label: "Rice" },
  { id: "dessert", label: "Dessert" },
  { id: "live", label: "Live Counters" },
];

const today = () => {
  const d = new Date();
  const y = d.getFullYear();
  const m = d.getMonth();
  const day = d.getDate();
  return new Date(y, m, day);
};

const combineTime = (hhmm, baseDate = today()) => {
  const [hh, mm] = hhmm.split(":").map((v) => Number(v));
  const d = new Date(baseDate);
  d.setHours(hh, mm, 0, 0);
  return d;
};

export function createInitialKitchenState() {
  // Two “today” events so synergy/batch-prep can be demonstrated.
  const events = [
    {
      id: "mehta-wedding",
      name: "Mehta Wedding",
      tier: "Elite",
      plannedPax: 320,
      liveArrivalPax: 352,
      startTime: combineTime("18:30"),
      endTime: combineTime("22:30"),
    },
    {
      id: "sharma-corporate",
      name: "Sharma Corporate Dinner",
      tier: "Premium",
      plannedPax: 210,
      liveArrivalPax: 196,
      startTime: combineTime("19:15"),
      endTime: combineTime("22:00"),
    },
  ];

  // Dietary flags for badges.
  // Each dish uses portions for manifest + served stepper, and kg for stock/waste.
  const DISHES = [
    // Welcome drinks
    {
      id: "mocktail-bar",
      course: "welcome",
      name: "Signature Mocktail Bar",
      cuisineTag: "Contemporary",
      dietary: { veg: true, jain: false, halal: true, gf: true },
      chefStation: "Station 1 — Mocktail",
      portionPerPax: 0.18,
      portionSizeKg: 0.08,
      unitCostPerKg: 42,
      stockKg: 46,
      synergy: [{ eventId: "sharma-corporate", label: "Batch prep for Corporate Dinner" }],
    },

    // Starters
    {
      id: "paneer-tikka",
      course: "starters",
      name: "Paneer Tikka",
      cuisineTag: "North Indian",
      dietary: { veg: true, jain: true, halal: true, gf: true },
      chefStation: "Station 2 — Tandoor",
      portionPerPax: 0.12,
      portionSizeKg: 0.12,
      unitCostPerKg: 58,
      stockKg: 28,
      synergy: [],
    },
    {
      id: "chicken-tikka",
      course: "starters",
      name: "Chicken Tikka",
      cuisineTag: "North Indian",
      dietary: { veg: false, jain: false, halal: true, gf: false, nonVeg: true },
      chefStation: "Station 3 — Tandoor",
      portionPerPax: 0.12,
      portionSizeKg: 0.13,
      unitCostPerKg: 72,
      stockKg: 22,
      synergy: [],
    },

    // Soup
    {
      id: "veg-minestrone",
      course: "soup",
      name: "Roasted Veg Soup",
      cuisineTag: "Continental",
      dietary: { veg: true, jain: true, halal: true, gf: true },
      chefStation: "Station 4 — Soup",
      portionPerPax: 0.1,
      portionSizeKg: 0.22,
      unitCostPerKg: 48,
      stockKg: 52,
      synergy: [],
    },

    // Main
    {
      id: "biryani",
      course: "main",
      name: "Hyderabadi Biryani",
      cuisineTag: "Hyderabadi",
      dietary: { veg: false, jain: false, halal: true, gf: true, nonVeg: true },
      chefStation: "Station 5 — Biryani Pot",
      portionPerPax: 0.22,
      portionSizeKg: 0.26,
      unitCostPerKg: 86,
      stockKg: 64,
      synergy: [{ eventId: "sharma-corporate", label: "Batch prep for Corporate Dinner" }],
    },
    {
      id: "butter-paneer",
      course: "main",
      name: "Butter Paneer Masala",
      cuisineTag: "North Indian",
      dietary: { veg: true, jain: false, halal: true, gf: false },
      chefStation: "Station 6 — Main Gravy",
      portionPerPax: 0.18,
      portionSizeKg: 0.22,
      unitCostPerKg: 62,
      stockKg: 40,
      synergy: [],
    },
    {
      id: "veg-pulao",
      course: "main",
      name: "Veg Pulao",
      cuisineTag: "North Indian",
      dietary: { veg: true, jain: true, halal: true, gf: false },
      chefStation: "Station 5 — Biryani Pot",
      portionPerPax: 0.2,
      portionSizeKg: 0.23,
      unitCostPerKg: 55,
      stockKg: 30,
      synergy: [{ eventId: "sharma-corporate", label: "Also needed for Corporate Dinner" }],
    },

    // Breads
    {
      id: "butter-naan",
      course: "breads",
      name: "Butter Naan",
      cuisineTag: "Afghan",
      dietary: { veg: true, jain: false, halal: true, gf: false },
      chefStation: "Station 7 — Tandoor",
      portionPerPax: 0.14,
      portionSizeKg: 0.06,
      unitCostPerKg: 44,
      stockKg: 24,
      synergy: [],
    },

    // Rice
    {
      id: "jeera-rice",
      course: "rice",
      name: "Jeera Rice",
      cuisineTag: "Indian",
      dietary: { veg: true, jain: true, halal: true, gf: true },
      chefStation: "Station 8 — Rice",
      portionPerPax: 0.16,
      portionSizeKg: 0.2,
      unitCostPerKg: 52,
      stockKg: 48,
      synergy: [],
    },

    // Dessert
    {
      id: "gulab-jamun",
      course: "dessert",
      name: "Gulab Jamun",
      cuisineTag: "Indian Sweets",
      dietary: { veg: true, jain: false, halal: true, gf: false },
      chefStation: "Station 9 — Dessert",
      portionPerPax: 0.08,
      portionSizeKg: 0.09,
      unitCostPerKg: 38,
      stockKg: 26,
      synergy: [],
    },

    // Live counters
    {
      id: "chaat-live",
      course: "live",
      name: "Chaat Live Counter",
      cuisineTag: "Street Fusion",
      dietary: { veg: true, jain: true, halal: true, gf: false },
      chefStation: "Live Counter — Chaat",
      portionPerPax: 0.1,
      portionSizeKg: 0.16,
      unitCostPerKg: 50,
      stockKg: 20,
      synergy: [{ eventId: "sharma-corporate", label: "Batch prep for Corporate Dinner" }],
    },
  ];

  const dishesByEvent = {};
  for (const ev of events) {
    const pax = ev.plannedPax;
    dishesByEvent[ev.id] = DISHES.map((d) => {
      const plannedPortions = pax * d.portionPerPax;
      const adjustedPortions = plannedPortions; // will be recalculated on sync
      const plannedKg = plannedPortions * d.portionSizeKg;
      const requiredKg = adjustedPortions * d.portionSizeKg;
      const stockKg = d.stockKg;
      return {
        ...d,
        plannedPortions,
        adjustedPortions,
        plannedKg,
        requiredKg,
        stockKg,
        servedPortions: 0,
        closed: false,
        synergyDecision: null, // null | 'accepted' | 'dismissed'
        // status derived from served + closed
        lastPortionLogAt: null,
      };
    });
  }

  // Timeline tasks are derived from dishes. We create station tasks per course.
  // These are “scheduled” relative to event start time, but status/done is user-driven.
  const tasksByEvent = {};
  const stationForCourse = (courseId) => {
    switch (courseId) {
      case "welcome":
        return "Cold Kitchen";
      case "starters":
        return "Hot Kitchen";
      case "soup":
        return "Cold Kitchen";
      case "main":
        return "Tandoor";
      case "breads":
        return "Tandoor";
      case "rice":
        return "Live Counter";
      case "dessert":
        return "Pastry";
      case "live":
        return "Live Counter";
      default:
        return "Hot Kitchen";
    }
  };

  const courseOffsetMinutes = {
    welcome: -120,
    starters: -40,
    soup: -30,
    main: -12,
    breads: -10,
    rice: -6,
    dessert: 30,
    live: 10,
  };

  const tasks = (ev) => {
    // Build one task per dish for prototype.
    const list = [];
    const nowBase = ev.startTime;
    const minutesToMs = (m) => m * 60 * 1000;

    for (const dish of dishesByEvent[ev.id]) {
      const offset = courseOffsetMinutes[dish.course] ?? -30;
      // Stagger tasks within the same course window.
      const jitter = Math.floor((dish.name.length % 7) * 2);
      const startAt = new Date(nowBase.getTime() + minutesToMs(offset + jitter));
      const durationMin = Math.max(12, Math.floor(10 + dish.portionPerPax * 90));
      list.push({
        id: `task-${ev.id}-${dish.id}`,
        dishId: dish.id,
        dishName: dish.name,
        courseId: dish.course,
        station: stationForCourse(dish.course),
        chefStationTag: dish.chefStation,
        assignedChef: "Sous Chef",
        startAt,
        durationMin,
        done: false,
        doneAt: null,
        critical: ["main", "breads", "rice"].includes(dish.course),
      });
    }
    return list;
  };

  for (const ev of events) {
    tasksByEvent[ev.id] = tasks(ev);
  }

  const leftoverPrelogByEvent = {};
  const wasteByEvent = {};
  const wasteSubmitted = {};
  const lastSyncedAtByEvent = {};

  for (const ev of events) {
    leftoverPrelogByEvent[ev.id] = {};
    wasteByEvent[ev.id] = {};
    wasteSubmitted[ev.id] = { submitted: false, submittedAt: null };
    lastSyncedAtByEvent[ev.id] = null;
  }

  return {
    selectedEventId: events[0]?.id ?? null,
    events,
    dishesByEvent,
    tasksByEvent,
    leftoverPrelogByEvent,
    wasteByEvent,
    wasteSubmitted,
    lastSyncedAtByEvent,
    featherless: {
      loadingByDishId: {},
      insightsByDishId: {},
      lastSubmittedAt: null,
    },
    adminSynergyAlerts: [],
    ui: {
      view: "dashboard", // dashboard | manifest | timeline | waste
      showToast: null,
      modal: null,
    },
  };
}

export function computeDishStatus(dish) {
  if (dish.closed) return "Closed";
  if (dish.servedPortions >= dish.adjustedPortions - 1e-6) return "Served";
  if (dish.servedPortions > 0) return "In Progress";
  return "Prep Pending";
}

export function deriveTotalsForEvent(dishes) {
  const totals = {
    veg: 0,
    nonVeg: 0,
    jain: 0,
    halal: 0,
    gf: 0,
  };

  for (const d of dishes) {
    const plates = Math.max(0, d.adjustedPortions);
    if (d.dietary?.veg) totals.veg += plates;
    if (d.dietary?.nonVeg) totals.nonVeg += plates;
    if (d.dietary?.jain) totals.jain += plates;
    if (d.dietary?.halal) totals.halal += plates;
    if (d.dietary?.gf) totals.gf += plates;
  }
  return totals;
}

export function downloadText(filename, text, mime = "text/plain;charset=utf-8") {
  const blob = new Blob([text], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function formatTime(d) {
  const hh = d.getHours().toString().padStart(2, "0");
  const mm = d.getMinutes().toString().padStart(2, "0");
  return `${hh}:${mm}`;
}

export function msToHMS(ms) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

