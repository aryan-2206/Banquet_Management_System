const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

async function request(endpoint, options = {}) {
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'API request failed');
  return data;
}

export const api = {
  // Bookings
  createBooking: (body)           => request('/bookings', { method: 'POST', body: JSON.stringify(body) }),
  getBookings: (params = '')      => request(`/bookings${params}`),
  checkAvailability: (date, venue)=> request(`/bookings/check-availability?date=${date}&venue=${encodeURIComponent(venue)}`),
  updateBookingStatus: (id, status) => request(`/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Payments
  getPayments: (status = '')      => request(`/payments${status ? `?status=${status}` : ''}`),
  recordPayment: (id, body)       => request(`/payments/${id}/record`, { method: 'POST', body: JSON.stringify(body) }),
  confirmBooking: (id)            => request(`/payments/${id}/confirm`, { method: 'PATCH' }),
  updateInstallmentPlan: (id, plan) => request(`/payments/${id}/installment-plan`, { method: 'PUT', body: JSON.stringify({ installmentPlan: plan }) }),
  toggleTranche: (id, trancheIdx) => request(`/payments/${id}/tranche/${trancheIdx}/toggle`, { method: 'PATCH' }),

  // Auth
  login: (body)                   => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body)                => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  // Menu
  getMenuTiers: ()                => request('/menu/tiers'),

  // WhatsApp
  sendWhatsapp: (phone, type, data) => request('/whatsapp/send', { method: 'POST', body: JSON.stringify({ phone, type, data }) }),

  // AI
  getInsights: ()                 => request('/ai/insights'),

  // Kitchen
  getKitchenEvents: ()            => request('/kitchen/events'),
  getLiveHeadcount: (id)          => request(`/kitchen/live-pax/${id}`),

  // Health
  health: ()                      => request('/health'),
};

export default api;
