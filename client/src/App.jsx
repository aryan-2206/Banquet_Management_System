import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';

import LandingModulePage    from './pages/LandingModule';
import LoginModal           from './pages/LoginModal';
import useAuthStore         from './pages/finance/useAuthStore';

/* ── Finance ── */
import FinanceDashboard     from './pages/finance/FinanceDashboard';
import PaymentLedger        from './pages/finance/PaymentLedger';
import InstallmentBuilder   from './pages/finance/InstallmentBuilder';
import GSTReport            from './pages/finance/GSTReport';

/* ── GRE ── */
import GREDashboard         from './pages/gre/GREDashboard';
import QRScanner            from './pages/gre/QRScanner';
import GuestList            from './pages/gre/GuestList';
import LiveCheckin          from './pages/gre/LiveCheckin';
import WalkInForm           from './pages/gre/WalkInForm';
import GREAuditLog          from './pages/gre/GREAuditLog';
import GRELoginModal        from './pages/gre/GRELoginModal';

/* ── Admin ── */
import AdminDashboard       from './pages/admin/AdminDashboard';
import CancellationLog      from './pages/admin/CancellationLog';
import StaffAssignment      from './pages/admin/StaffAssignment';

/* ── Kitchen ── */
import KitchenDashboard     from './pages/kitchen/KitchenDashboard';
import MenuManifest         from './pages/kitchen/MenuManifest';
import PrepTimeline         from './pages/kitchen/PrepTimeline';
import WasteLogger          from './pages/kitchen/WasteLogger';

/* ── Sales ── */
import SalesDashboard       from './pages/sales/SalesDashboard';
import NewBooking           from './pages/sales/NewBooking';

/* ── DJ ── */
import DJLiveView           from './pages/dj/DJLiveView';

/* ── Client Portal ── */
import ClientDashboard      from './pages/client-portal/ClientDashboard';
import EventSummary         from './pages/client-portal/EventSummary';
import FeedbackForm         from './pages/client-portal/FeedbackForm';
import GuestRSVP            from './pages/client-portal/GuestRSVP';

/* ─────────────────────────────────────────────
   Route map: module id → base path
───────────────────────────────────────────── */
const MODULE_ROUTES = {
  finance: '/finance',
  gre:     '/gre',
  admin:   '/admin',
  kitchen: '/kitchen',
  sales:   '/sales',
  dj:      '/dj',
  client:  '/client',
};

/* ─────────────────────────────────────────────
   Landing wrapper — intercepts all module clicks
   and forces auth before routing.
───────────────────────────────────────────── */
function LandingWithAuth() {
  const navigate = useNavigate();

  const [modalOpen,    setModalOpen]    = useState(false);
  const [greModalOpen, setGreModalOpen] = useState(false);
  const [targetRole,   setTargetRole]   = useState('finance');

  function handleSetPage(pageId) {
    if (pageId === 'gre') {
      setGreModalOpen(true);
      return;
    }
    if (MODULE_ROUTES[pageId]) {
      setTargetRole(pageId);
      setModalOpen(true);
    }
  }

  function handleLoginSuccess(user) {
    setModalOpen(false);
    navigate(MODULE_ROUTES[user.role] || '/');
  }

  return (
    <>
      <LandingModulePage
        onModuleClick={handleSetPage}
        onStaffLogin={() => setGreModalOpen(true)}
      />
      <LoginModal
        open={modalOpen}
        targetRole={targetRole}
        onClose={() => setModalOpen(false)}
        onSuccess={handleLoginSuccess}
      />
      <GRELoginModal
        open={greModalOpen}
        onClose={() => setGreModalOpen(false)}
      />
    </>
  );
}

/* ─────────────────────────────────────────────
   ProtectedRoute — redirects to / if not authed
   or wrong role. Accepts comma-list for multi-role.
───────────────────────────────────────────── */
function ProtectedRoute({ role, children }) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const allowedRoles = role ? role.split('|') : [];

  React.useEffect(() => {
    if (!user) {
      navigate('/', { replace: true });
    } else if (allowedRoles.length && !allowedRoles.includes(user.role)) {
      navigate('/', { replace: true });
    }
  }, [user, role, navigate]);

  if (!user) return null;
  if (allowedRoles.length && !allowedRoles.includes(user.role)) return null;
  return children;
}

/* ─────────────────────────────────────────────
   APP — all module routes wired & protected
───────────────────────────────────────────── */
export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Landing */}
        <Route path="/" element={<LandingWithAuth />} />

        {/* ── Finance ── */}
        <Route path="/finance" element={<ProtectedRoute role="finance"><FinanceDashboard /></ProtectedRoute>} />
        <Route path="/finance/ledger" element={<ProtectedRoute role="finance"><PaymentLedger /></ProtectedRoute>} />
        <Route path="/finance/installments" element={<ProtectedRoute role="finance"><InstallmentBuilder /></ProtectedRoute>} />
        <Route path="/finance/gst" element={<ProtectedRoute role="finance"><GSTReport /></ProtectedRoute>} />

        {/* ── GRE ── */}
        <Route path="/gre" element={<ProtectedRoute role="gre|admin"><GREDashboard /></ProtectedRoute>} />
        <Route path="/gre/scanner" element={<ProtectedRoute role="gre|admin"><QRScanner /></ProtectedRoute>} />
        <Route path="/gre/guests" element={<ProtectedRoute role="gre|admin"><GuestList /></ProtectedRoute>} />
        <Route path="/gre/live" element={<ProtectedRoute role="gre|admin"><LiveCheckin /></ProtectedRoute>} />
        <Route path="/gre/walkin" element={<ProtectedRoute role="gre|admin"><WalkInForm /></ProtectedRoute>} />
        <Route path="/gre/audit" element={<ProtectedRoute role="gre|admin"><GREAuditLog /></ProtectedRoute>} />

        {/* ── Admin ── */}
        <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/cancellations" element={<ProtectedRoute role="admin"><CancellationLog /></ProtectedRoute>} />
        <Route path="/admin/staff" element={<ProtectedRoute role="admin"><StaffAssignment /></ProtectedRoute>} />

        {/* ── Kitchen ── */}
        <Route path="/kitchen" element={<ProtectedRoute role="kitchen|admin"><KitchenDashboard /></ProtectedRoute>} />
        <Route path="/kitchen/menu" element={<ProtectedRoute role="kitchen|admin"><MenuManifest /></ProtectedRoute>} />
        <Route path="/kitchen/prep" element={<ProtectedRoute role="kitchen|admin"><PrepTimeline /></ProtectedRoute>} />
        <Route path="/kitchen/waste" element={<ProtectedRoute role="kitchen|admin"><WasteLogger /></ProtectedRoute>} />

        {/* ── Sales ── */}
        <Route path="/sales" element={<ProtectedRoute role="sales|admin"><SalesDashboard /></ProtectedRoute>} />
        <Route path="/sales/new" element={<ProtectedRoute role="sales|admin"><NewBooking /></ProtectedRoute>} />

        {/* ── DJ ── */}
        <Route path="/dj" element={<ProtectedRoute role="dj|admin"><DJLiveView /></ProtectedRoute>} />

        {/* ── Client Portal ── */}
        <Route path="/client" element={<ProtectedRoute role="client"><ClientDashboard /></ProtectedRoute>} />
        <Route path="/client/summary" element={<ProtectedRoute role="client"><EventSummary /></ProtectedRoute>} />
        <Route path="/client/feedback" element={<ProtectedRoute role="client"><FeedbackForm /></ProtectedRoute>} />
        <Route path="/client/rsvp" element={<ProtectedRoute role="client"><GuestRSVP /></ProtectedRoute>} />

      </Routes>
    </BrowserRouter>
  );
}