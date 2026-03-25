import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import SalesDashboard from './pages/sales/SalesDashboard';
import NewBooking from './pages/sales/NewBooking';
import BookingDetail from './pages/sales/BookingDetail';
import VenueCalendar from './pages/sales/VenueCalendar';

import KitchenDashboard from './pages/kitchen/KitchenDashboard';
import DJLiveView from './pages/dj/DJLiveView';
import ClientDashboard from './pages/client-portal/ClientDashboard';
import FinanceDashboard from './pages/finance/FinanceDashboard';
import GREDashboard from './pages/gre/GREDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';

export default function App() {
  return (
    <Routes>
      {/* Landing */}
      <Route path="/" element={<LandingPage />} />

      {/* Sales */}
      <Route path="/sales" element={<SalesDashboard />} />
      <Route path="/sales/new" element={<NewBooking />} />
      <Route path="/sales/booking/:id" element={<BookingDetail />} />
      <Route path="/sales/calendar" element={<VenueCalendar />} />

      {/* Other modules */}
      <Route path="/kitchen" element={<KitchenDashboard />} />
      <Route path="/dj" element={<DJLiveView />} />
      <Route path="/client" element={<ClientDashboard />} />
      <Route path="/finance" element={<FinanceDashboard />} />
      <Route path="/gre" element={<GREDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}