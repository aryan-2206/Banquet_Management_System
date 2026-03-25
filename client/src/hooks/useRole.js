/**
 * useRole — returns the current user's role from localStorage or a default
 */
export default function useRole() {
  const stored = typeof window !== 'undefined' ? localStorage.getItem('userRole') : null;
  const role = stored || 'guest';
  const setRole = (r) => localStorage.setItem('userRole', r);

  const can = (requiredRole) => {
    const hierarchy = ['guest', 'client', 'dj', 'gre', 'kitchen', 'sales', 'finance', 'admin'];
    return hierarchy.indexOf(role) >= hierarchy.indexOf(requiredRole);
  };

  return { role, setRole, can };
}
