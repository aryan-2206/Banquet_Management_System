import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import SalesDashboard from './pages/sales/SalesDashboard';
import NewBooking from './pages/sales/NewBooking';
import BookingDetail from './pages/sales/BookingDetail';
import VenueCalendar from './pages/sales/VenueCalendar';
import EventDetail from './pages/client-portal/EventDetail';

import KitchenDashboard from './pages/kitchen/KitchenDashboard';
import DJLiveView from './pages/dj/DJLiveView';
import ClientDashboard from './pages/client-portal/ClientDashboard';
import FinanceDashboard from './pages/finance/FinanceDashboard';
import PaymentLedger from './pages/finance/PaymentLedger';
import InstallmentBuilder from './pages/finance/InstallmentBuilder';
import GSTReport from './pages/finance/GSTReport';
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
      <Route path="/client/event-detail" element={<EventDetail />} />
      <Route path="/client/event-detail/:id" element={<EventDetail />} />
      <Route path="/finance" element={<FinanceDashboard />} />
      <Route path="/finance/ledger" element={<PaymentLedger />} />
      <Route path="/finance/installments" element={<InstallmentBuilder />} />
      <Route path="/finance/gst" element={<GSTReport />} />
      <Route path="/gre" element={<GREDashboard />} />
      <Route path="/admin" element={<AdminDashboard />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}