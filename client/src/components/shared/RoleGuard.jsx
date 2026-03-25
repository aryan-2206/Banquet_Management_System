import React from 'react';
import useRole from '../../hooks/useRole';

/**
 * RoleGuard — renders children only if user has the required role
 * @param {string} requires - minimum role required
 * @param {React.ReactNode} fallback - rendered when access is denied
 */
export default function RoleGuard({ requires = 'guest', fallback = null, children }) {
  const { can } = useRole();
  if (!can(requires)) return fallback;
  return children;
}
