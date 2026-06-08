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
  getBooking: (id)                => request(`/bookings/${id}`),
  checkAvailability: (date, venue)=> request(`/bookings/check-availability?date=${date}&venue=${encodeURIComponent(venue)}`),
  updateBookingStatus: (id, status) => request(`/bookings/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Payments
  getPayments: (status = '')      => request(`/payments${status ? `?status=${status}` : ''}`),
  recordPayment: (id, body)       => request(`/payments/${id}/record`, { method: 'POST', body: JSON.stringify(body) }),
  confirmBooking: (id)            => request(`/payments/${id}/confirm`, { method: 'PATCH' }),
  updateInstallmentPlan: (id, plan) => request(`/payments/${id}/installment-plan`, { method: 'PUT', body: JSON.stringify({ installmentPlan: plan }) }),
  toggleTranche: (id, trancheIdx) => request(`/payments/${id}/tranche/${trancheIdx}/toggle`, { method: 'PATCH' }),
  getPaymentByBooking: (bookingId) => request(`/payments?booking=${bookingId}`),

  // Auth
  login: (body)                   => request('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  register: (body)                => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),

  // Menu
  getMenuTiers: ()                => request('/menu/tiers'),

  // WhatsApp
  sendWhatsapp: (phone, type, data) => request('/whatsapp/send', { method: 'POST', body: JSON.stringify({ phone, type, data }) }),

  // AI
  getInsights: ()                 => request('/ai/insights'),
getDishes: (params = '')        => request(`/dishes${params}`),
updateDishStatus: (id, status)  => request(`/dishes/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Kitchen
  getKitchenEvents: ()            => request('/kitchen/events'),
  getLiveHeadcount: (id)          => request(`/kitchen/live-pax/${id}`),

  // Stock
  getStock: (params = '')         => request(`/stock${params}`),
  getStockAlerts: ()              => request('/stock/alerts'),
  adjustStock: (id, body)         => request(`/stock/${id}/quantity`, { method: 'PATCH', body: JSON.stringify(body) }),

  // PrepQueue
  getPrepQueue: (params = '')     => request(`/prepqueue${params}`),
  createPrepTask: (body)          => request('/prepqueue', { method: 'POST', body: JSON.stringify(body) }),
  updateTaskStatus: (id, status)  => request(`/prepqueue/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  toggleUrgent: (id)              => request(`/prepqueue/${id}/urgent`, { method: 'PATCH' }),
  deletePrepTask: (id)            => request(`/prepqueue/${id}`, { method: 'DELETE' }),

  // AI
  getInsights: ()                 => request('/ai/insights'),
  getMenuSuggestions: (params = '') => request(`/ai/menu-suggestions${params}`),
  getPostMortem: (bookingId)      => request(`/ai/post-mortem/${bookingId}`),

  // Health
  health: ()                      => request('/health'),
};

export default api;
