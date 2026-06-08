/**
 * ProtectedRoute HOC
 *
 * Reads the JWT stored in localStorage (key: 'bim_token') after login.
 * Decodes the role claim without a library (base64 decode of payload).
 * If the user's role is not in `allowedRoles`, redirects to '/'.
 *
 * Usage in App.jsx:
 *   <Route path="/finance" element={
 *     <ProtectedRoute allowedRoles={['finance', 'admin']}>
 *       <FinanceDashboard />
 *     </ProtectedRoute>
 *   } />
 */
import React from 'react';
import { Navigate } from 'react-router-dom';

/**
 * Decodes a JWT payload without verifying signature (client-side role check only).
 * Actual security is enforced by server-side middleware on every API call.
 */
function decodeJWT(token) {
  try {
    const payload = token.split('.')[1];
    // Base64URL → Base64 → JSON
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const token = localStorage.getItem('token');

  if (!token) {
    // No token → send to landing page
    return <Navigate to="/" replace />;
  }

  const decoded = decodeJWT(token);

  if (!decoded) {
    // Malformed token → clear and redirect
    localStorage.removeItem('token');
    return <Navigate to="/" replace />;
  }

  // Check expiry
  if (decoded.exp && Date.now() / 1000 > decoded.exp) {
    localStorage.removeItem('token');
    return <Navigate to="/" replace />;
  }

  // Check role — if allowedRoles is empty, any authenticated user can access
  const userRole = (decoded.role || '').toLowerCase();
  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole) && userRole !== 'admin') {
    // Wrong role → redirect to landing (RBAC enforcement)
    return <Navigate to="/" replace />;
  }

  return children;
}
