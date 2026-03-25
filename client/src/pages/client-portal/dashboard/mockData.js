// ── Mock data — replace with API calls in production ──

export const CLIENT = {
  name: 'Sharma Family',
  accountId: 'CLI-2026-0041',
  manager: { name: 'Priya Mehra', role: 'Senior Event Manager', initials: 'PM', color: '#9B6DE8', phone: '+91 98200 12345', wa: '+919820012345' },
  emergencyContact: { name: 'Rahul Kapoor (Day-Of)', phone: '+91 98300 99999' },
  venue: { name: 'Grand Maharaja Hall', address: '12 Palace Road, Ballard Estate, Mumbai 400001', mapsUrl: 'https://maps.google.com/?q=Grand+Maharaja+Hall+Mumbai' },
};

export const EVENTS = [
  {
    id: 'E001', type: 'wedding', name: 'Sharma — Gupta Wedding Reception',
    date: '2026-04-08', time: '18:00', hall: 'Grand Maharaja Hall',
    pax: { contracted: 350, confirmed: 312 }, menuTier: 'Elite',
    status: 'confirmed', totalValue: 875000, paid: 437500,
    instalments: [
      { label: 'Advance 50%',    amount: 437500, due: '2026-03-10', status: 'paid'    },
      { label: 'Final Balance',  amount: 437500, due: '2026-04-06', status: 'pending' },
    ],
    highlights: ['Paneer Tikka Masala','Dal Makhani','Gulab Jamun','Welcome Mocktail'],
    addOns: ['AV Setup', 'Live Counters', 'Floral Décor'],
    menuLocked: false,
    sessions: [],
    vendors: [
      { id:'V1', name:'Royal Blooms Décor',  service:'Decorator',    status:'confirmed' },
      { id:'V2', name:'PixelMoment Studios', service:'Photographer', status:'confirmed' },
      { id:'V3', name:'Bass Culture DJ Co.', service:'DJ Agency',    status:'pending'   },
    ],
  },
  {
    id: 'E002', type: 'corporate', name: 'TechCorp Annual Dinner 2026',
    date: '2026-05-15', time: '19:30', hall: 'Crystal Ballroom',
    pax: { contracted: 200, confirmed: 0 }, menuTier: 'Premium',
    status: 'pending_payment', totalValue: 420000, paid: 0,
    instalments: [
      { label: 'Advance 50%', amount: 210000, due: '2026-04-01', status: 'overdue' },
      { label: 'Final Balance', amount: 210000, due: '2026-05-12', status: 'pending' },
    ],
    highlights: ['Grilled Salmon','Pasta Primavera','Tiramisu','Open Bar'],
    addOns: ['LED Screen', 'Podium & Mic'],
    menuLocked: false, sessions: [], vendors: [],
  },
  {
    id: 'E003', type: 'birthday', name: 'Rohan\'s 50th Birthday Bash',
    date: '2026-02-14', time: '20:00', hall: 'Sunset Terrace',
    pax: { contracted: 80, confirmed: 80 }, menuTier: 'Standard',
    status: 'completed', totalValue: 120000, paid: 120000,
    instalments: [
      { label: 'Full Payment', amount: 120000, due: '2026-02-01', status: 'paid' },
    ],
    highlights: ['Butter Chicken','Naan','Biryani'], addOns: ['DJ'],
    menuLocked: true, sessions: [], vendors: [],
  },
];

export const NOTIFICATIONS = [
  { id: 1, icon: '💰', text: 'Payment of ₹4,37,500 received against E001',         time: '2 days ago',  tab: 'payments', read: false },
  { id: 2, icon: '📲', text: 'QR codes dispatched to 312 guests for E001',          time: '5 days ago',  tab: 'guests',   read: false },
  { id: 3, icon: '📋', text: 'Function Prospectus updated — E001 Rev 2',            time: '1 week ago',  tab: 'documents',read: true  },
  { id: 4, icon: '✅', text: 'Menu confirmed by Event Manager for E001',             time: '1 week ago',  tab: 'events',   read: true  },
  { id: 5, icon: '⚠️', text: 'Advance payment overdue for TechCorp Annual Dinner',  time: '3 days ago',  tab: 'payments', read: false },
];

export const DOCUMENTS = [
  { id: 'D1', eventId: 'E001', name: 'Purchase Order (PO)',       type: 'PO',       version: 2, date: '2026-03-15', size: '112 KB' },
  { id: 'D2', eventId: 'E001', name: 'Function Prospectus',       type: 'FP',       version: 2, date: '2026-03-20', size: '84 KB'  },
  { id: 'D3', eventId: 'E001', name: 'Payment Receipt — Advance', type: 'Receipt',  version: 1, date: '2026-03-10', size: '48 KB'  },
  { id: 'D4', eventId: 'E001', name: 'GST Invoice',               type: 'GST',      version: 1, date: '2026-03-11', size: '60 KB'  },
  { id: 'D5', eventId: 'E002', name: 'Purchase Order (PO)',       type: 'PO',       version: 1, date: '2026-03-18', size: '98 KB'  },
];

export const GUESTS_SUMMARY = {
  total: 312, confirmed: 280, pending: 32, withoutQR: 18,
  dietary: { veg: 195, nonVeg: 72, jain: 28, halal: 17 },
};

export const fmt = n => '₹' + Number(n).toLocaleString('en-IN');
export const fmtDate = d => new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
export const daysUntil = d => Math.ceil((new Date(d) - new Date()) / 86400000);

export const EVENT_TYPE_EMOJI = { wedding: '💍', corporate: '🏢', birthday: '🎂' };
export const STATUS_CONFIG = {
  confirmed:       { label: 'Confirmed',        color:'#5FBF8A', bg:'rgba(95,191,138,0.12)',  border:'rgba(95,191,138,0.3)'  },
  pending_payment: { label: 'Payment Pending',  color:'#E8C455', bg:'rgba(232,197,85,0.12)', border:'rgba(232,197,85,0.3)'  },
  completed:       { label: 'Completed',        color:'#9D9880', bg:'rgba(157,152,128,0.12)', border:'rgba(157,152,128,0.3)' },
  cancelled:       { label: 'Cancelled',        color:'#E85555', bg:'rgba(232,85,85,0.12)',   border:'rgba(232,85,85,0.3)'   },
};
