// Shared mock data for Sales-related pages.
// Kept in a separate file so Booking Details + Venue Calendar match the dashboard.

export const STATS = [
  { label: 'Active Bookings', value: 24, unit: '', trend: '+3 this week', up: true },
  { label: 'Revenue Pipeline', value: '₹18.4L', unit: '', trend: '+12% vs last month', up: true },
  { label: 'Pending Enquiries', value: 7, unit: '', trend: '2 need follow-up', up: false },
  { label: 'Avg. Pax / Event', value: 280, unit: 'pax', trend: 'Target: 300', up: null },
];

export const PIPELINE = [
  { stage: 'New Enquiry', count: 7, value: '₹4.2L', color: '#C9A96E' },
  { stage: 'Menu Pending', count: 5, value: '₹3.8L', color: '#A07840' },
  { stage: 'Finance Review', count: 4, value: '₹5.1L', color: '#6B7C6E' },
  { stage: 'Confirmed', count: 8, value: '₹5.3L', color: '#3A7A6E' },
];

export const BOOKINGS = [
  {
    id: 'BK-2601',
    party: 'Mehta Wedding',
    client: 'Rakesh Mehta',
    date: '14 Jul 2026',
    venue: 'Grand Ballroom',
    pax: 450,
    tier: 'Elite',
    status: 'confirmed',
    manager: 'Priya S.',
  },
  {
    id: 'BK-2598',
    party: 'Sharma Birthday',
    client: 'Neha Sharma',
    date: '18 Jul 2026',
    venue: 'Terrace Garden',
    pax: 120,
    tier: 'Premium',
    status: 'enquiry',
    manager: 'Aryan D.',
  },
  {
    id: 'BK-2593',
    party: 'Kapoor Reception',
    client: 'Vijay Kapoor',
    date: '22 Jul 2026',
    venue: 'Crystal Hall',
    pax: 320,
    tier: 'Elite',
    status: 'booked',
    manager: 'Priya S.',
  },
  {
    id: 'BK-2590',
    party: 'Tech Conf. Dinner',
    client: 'Infosys Ltd.',
    date: '25 Jul 2026',
    venue: 'Banquet Suite A',
    pax: 200,
    tier: 'Standard',
    status: 'confirmed',
    manager: 'Rohan K.',
  },
  {
    id: 'BK-2585',
    party: 'Gupta Anniversary',
    client: 'Sunil Gupta',
    date: '02 Aug 2026',
    venue: 'Rooftop Lounge',
    pax: 80,
    tier: 'Premium',
    status: 'temporary',
    manager: 'Aryan D.',
  },
  {
    id: 'BK-2580',
    party: 'Patel Engagement',
    client: 'Meera Patel',
    date: '10 Aug 2026',
    venue: 'Garden Pavilion',
    pax: 160,
    tier: 'Premium',
    status: 'enquiry',
    manager: 'Rohan K.',
  },
];

export const UPCOMING = [
  { time: '10:00', label: 'Site visit — Mehta Wedding', tag: 'confirmed' },
  { time: '12:30', label: 'Client call — Sharma Birthday', tag: 'enquiry' },
  { time: '15:00', label: 'Finance review — Kapoor Reception', tag: 'finance' },
  { time: '17:30', label: 'Menu tasting — Gupta Anniversary', tag: 'ops' },
];

export const TIER_COLORS = { Standard: '#6B7C6E', Premium: '#C9A96E', Elite: '#A07840' };

export const VENUES = Array.from(new Set(BOOKINGS.map((b) => b.venue)));

export function parseBookingDate(dateStr) {
  // dateStr format in mock data: "14 Jul 2026"
  const [dayStr, monStr, yearStr] = dateStr.split(' ');
  const day = Number(dayStr);
  const year = Number(yearStr);
  const months = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  };
  const month = months[monStr] ?? 0;
  return new Date(year, month, day);
}

