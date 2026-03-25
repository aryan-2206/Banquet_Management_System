export function createInitialAdminState() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const offsetDate = (days) => new Date(today.getTime() + days * 86400000);

  const mockEvents = [
    {
      id: "ev-01",
      name: "Mehta Wedding",
      clientName: "Rohan Mehta",
      hall: "Grand Ballroom",
      tier: "Elite",
      date: offsetDate(0),
      startTime: "18:30",
      pax: 350,
      status: {
        finance: "Balance pending",
        kitchen: "Active",
        gre: "Check-in open",
        dj: "Standby",
      },
      health: "Amber",
    },
    {
      id: "ev-02",
      name: "Sharma Corporate",
      clientName: "Priya Sharma",
      hall: "Sapphire Lounge",
      tier: "Premium",
      date: offsetDate(0),
      startTime: "19:15",
      pax: 200,
      status: {
        finance: "Paid in full",
        kitchen: "Pre-prep",
        gre: "Not started",
        dj: "Off",
      },
      health: "Green",
    },
    {
      id: "ev-03",
      name: "Patel Engagement",
      clientName: "Aman Patel",
      hall: "Ruby Hall",
      tier: "Standard",
      date: offsetDate(0),
      startTime: "20:00",
      pax: 120,
      status: {
        finance: "Overdue",
        kitchen: "Pre-prep",
        gre: "Not started",
        dj: "Standby",
      },
      health: "Red",
    },
    // Future events
    { id: "ev-04", name: "Singh Anniversary", hall: "Grand Ballroom", tier: "Elite", date: offsetDate(1), pax: 250 },
    { id: "ev-05", name: "Tech Launch 2026", hall: "Sapphire Lounge", tier: "Premium", date: offsetDate(2), pax: 400 },
    { id: "ev-06", name: "Kumar Reception", hall: "Ruby Hall", tier: "Standard", date: offsetDate(2), pax: 150 },
    { id: "ev-07", name: "Diwali Gala", hall: "Grand Ballroom", tier: "Elite", date: offsetDate(4), pax: 500 },
  ];

  const pendingActions = [
    { id: "act-1", text: "Sharma Corporate — balance payment due in 3 days", source: "Finance", priority: "Urgent", due: offsetDate(-1) },
    { id: "act-2", text: "Mehta Wedding — function prospectus not yet sent", source: "Sales", priority: "Today", due: offsetDate(0) },
    { id: "act-3", text: "Patel Engagement — guest list not uploaded", source: "GRE", priority: "Today", due: offsetDate(0) },
    { id: "act-4", text: "Waste report for last Saturday's event not submitted", source: "Kitchen", priority: "This week", due: offsetDate(2) },
  ];

  const galleryQueue = [
    { id: "p-1", src: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=200", flagged: true, reason: "Possible blur/quality issue" },
    { id: "p-2", src: "https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=200", flagged: false },
    { id: "p-3", src: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&q=80&w=200", flagged: true, reason: "Inappropriate gesture detected" },
    { id: "p-4", src: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&q=80&w=200", flagged: false },
  ];

  const aiInsights = [
    "Your Elite tier bookings have a 94% payment completion rate vs 71% for Standard — consider tightening the deposit policy for lower tiers.",
    "Three Saturday slots in December are still unbooked — target corporate year-end events.",
    "Kitchen waste on Premium buffets is 14% higher than set menus. Review portion ratios for Platinum setups.",
  ];

  return {
    events: mockEvents,
    pendingActions,
    galleryQueue,
    aiInsights,
    kpis: {
      revenue: "₹42.5L",
      revDelta: "+12%",
      eventsMonth: { total: 42, confirmed: 28, enquiry: 10, cancelled: 4 },
      collectionEff: "88%",
      avgPax: 220,
      receivables: "₹14.2L",
    },
    notifications: 4,
  };
}
