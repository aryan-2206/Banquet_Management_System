import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/shared/Sidebar';
import SalesDashboard from './pages/sales/SalesDashboard';
import NewBooking from './pages/sales/NewBooking';
import './styles/globals.css';
import './App.css';

// Placeholder pages for other routes
const Placeholder = ({ title }) => (
  <div style={{ padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
    <div style={{ textAlign: 'center' }}>
      <h2 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '32px', color: 'var(--ink)', marginBottom: '8px' }}>{title}</h2>
      <p style={{ color: 'var(--ink-60)', fontSize: '14px' }}>Module coming soon…</p>
    </div>
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Sidebar />
        <main className="app__main">
          <Routes>
            <Route path="/"                 element={<Navigate to="/sales" replace />} />
            <Route path="/sales"            element={<SalesDashboard />} />
            <Route path="/sales/new"        element={<NewBooking />} />
            <Route path="/sales/calendar"   element={<Placeholder title="Venue Calendar" />} />
            <Route path="/sales/:id"        element={<Placeholder title="Booking Detail" />} />
            <Route path="/finance"          element={<Placeholder title="Finance Dashboard" />} />
            <Route path="/finance/ledger"   element={<Placeholder title="Payment Ledger" />} />
            <Route path="/finance/gst"      element={<Placeholder title="GST Reports" />} />
            <Route path="/kitchen"          element={<Placeholder title="Kitchen Dashboard" />} />
            <Route path="/gre"              element={<Placeholder title="GRE Check-in" />} />
            <Route path="/dj"               element={<Placeholder title="DJ Live View" />} />
            <Route path="/admin"            element={<Placeholder title="Admin Panel" />} />
            <Route path="/admin/reports"    element={<Placeholder title="Reports & Audit" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}