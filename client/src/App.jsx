import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from './components/shared/ProtectedRoute';

// Pages
import LandingPage        from './pages/LandingPage';
import SalesDashboard     from './pages/sales/SalesDashboard';
import NewBooking         from './pages/sales/NewBooking';
import BookingDetail      from './pages/sales/BookingDetail';
import VenueCalendar      from './pages/sales/VenueCalendar';
import KitchenDashboard   from './pages/kitchen/KitchenDashboard';
import MenuManifest       from './pages/kitchen/MenuManifest';
import WasteLogger        from './pages/kitchen/WasteLogger';
import DJLiveView         from './pages/dj/DJLiveView';
import ClientDashboard    from './pages/client-portal/ClientDashboard';
import EventDetail        from './pages/client-portal/EventDetail';
import GuestRSVP          from './pages/client-portal/GuestRSVP';
import FinanceDashboard   from './pages/finance/FinanceDashboard';
import PaymentLedger      from './pages/finance/PaymentLedger';
import InstallmentBuilder from './pages/finance/InstallmentBuilder';
import GSTReport          from './pages/finance/GSTReport';

// GRE module — full sub-route set
import GREDashboard   from './pages/gre/GREDashboard';
import QRScanner      from './pages/gre/QRScanner';
import WalkInForm     from './pages/gre/WalkInForm';
import LiveCheckin    from './pages/gre/LiveCheckin';
import GuestList      from './pages/gre/GuestList';

import AdminDashboard from './pages/admin/AdminDashboard';

export default function App() {
  return (
    <Routes>
      {/* ── Public ──────────────────────────────────────── */}
      <Route path="/" element={<LandingPage />} />

      {/* ── Guest-facing DJ song request (no login needed) ─ */}
      <Route path="/request/:eventId" element={<DJLiveView guestMode />} />

      {/* ── Sales ───────────────────────────────────────── */}
      <Route path="/sales" element={
        <ProtectedRoute allowedRoles={['sales', 'admin']}>
          <SalesDashboard />
        </ProtectedRoute>
      } />
      <Route path="/sales/new" element={
        <ProtectedRoute allowedRoles={['sales', 'admin']}>
          <NewBooking />
        </ProtectedRoute>
      } />
      <Route path="/sales/booking/:id" element={
        <ProtectedRoute allowedRoles={['sales', 'admin']}>
          <BookingDetail />
        </ProtectedRoute>
      } />
      <Route path="/sales/calendar" element={
        <ProtectedRoute allowedRoles={['sales', 'admin']}>
          <VenueCalendar />
        </ProtectedRoute>
      } />

      {/* ── Kitchen ─────────────────────────────────────── */}
      <Route path="/kitchen" element={
        <ProtectedRoute allowedRoles={['kitchen', 'admin']}>
          <KitchenDashboard />
        </ProtectedRoute>
      } />
      <Route path="/kitchen/menu-manifest" element={
        <ProtectedRoute allowedRoles={['kitchen', 'admin']}>
          <MenuManifest />
        </ProtectedRoute>
      } />
      <Route path="/kitchen/waste-logger" element={
        <ProtectedRoute allowedRoles={['kitchen', 'admin']}>
          <WasteLogger />
        </ProtectedRoute>
      } />

      {/* ── DJ ──────────────────────────────────────────── */}
      <Route path="/dj" element={
        <ProtectedRoute allowedRoles={['dj', 'admin']}>
          <DJLiveView />
        </ProtectedRoute>
      } />

      {/* ── Client Portal ───────────────────────────────── */}
      <Route path="/client"                    element={<ClientDashboard />} />
      <Route path="/client/event-detail"       element={<EventDetail />} />
      <Route path="/client/event-detail/:id"   element={<EventDetail />} />
      <Route path="/client/rsvp"               element={<GuestRSVP />} />
      <Route path="/client/rsvp/:id"           element={<GuestRSVP />} />

      {/* ── Finance ─────────────────────────────────────── */}
      <Route path="/finance" element={
        <ProtectedRoute allowedRoles={['finance', 'admin']}>
          <FinanceDashboard />
        </ProtectedRoute>
      } />
      <Route path="/finance/ledger" element={
        <ProtectedRoute allowedRoles={['finance', 'admin']}>
          <PaymentLedger />
        </ProtectedRoute>
      } />
      <Route path="/finance/installments" element={
        <ProtectedRoute allowedRoles={['finance', 'admin']}>
          <InstallmentBuilder />
        </ProtectedRoute>
      } />
      <Route path="/finance/gst" element={
        <ProtectedRoute allowedRoles={['finance', 'admin']}>
          <GSTReport />
        </ProtectedRoute>
      } />

      {/* ── GRE — all sub-routes fixed ──────────────────── */}
      <Route path="/gre" element={
        <ProtectedRoute allowedRoles={['gre', 'admin']}>
          <GREDashboard />
        </ProtectedRoute>
      } />
      <Route path="/gre/scanner" element={
        <ProtectedRoute allowedRoles={['gre', 'admin']}>
          <QRScanner />
        </ProtectedRoute>
      } />
      <Route path="/gre/walkin" element={
        <ProtectedRoute allowedRoles={['gre', 'admin']}>
          <WalkInForm />
        </ProtectedRoute>
      } />
      <Route path="/gre/live" element={
        <ProtectedRoute allowedRoles={['gre', 'admin']}>
          <LiveCheckin />
        </ProtectedRoute>
      } />
      <Route path="/gre/guests" element={
        <ProtectedRoute allowedRoles={['gre', 'admin']}>
          <GuestList />
        </ProtectedRoute>
      } />

      {/* ── Admin ───────────────────────────────────────── */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />

      {/* ── Fallback ────────────────────────────────────── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}