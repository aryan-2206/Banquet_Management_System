import { create } from 'zustand';

/**
 * Credential table — in a real app this would be a server-side JWT flow.
 * Each entry: { username, password, role, name, initials }
 */
const CREDENTIALS = [
  { username: 'finance',  password: 'finance123',  role: 'finance',  name: 'Ananya Shah',    initials: 'AS' },
  { username: 'sales',    password: 'sales123',    role: 'sales',    name: 'Aryan Doshi',    initials: 'AD' },
  { username: 'admin',    password: 'admin123',     role: 'admin',    name: 'Priya Kumar',    initials: 'PK' },
  { username: 'kitchen',  password: 'kitchen123',  role: 'kitchen',  name: 'Suresh Menon',   initials: 'SM' },
  { username: 'gre',      password: 'gre123',      role: 'gre',      name: 'Neha Trivedi',   initials: 'NT' },
  { username: 'dj',       password: 'dj123',       role: 'dj',       name: 'Ricky Fernandes',initials: 'RF' },
  { username: 'client',   password: 'client123',   role: 'client',   name: 'Guest User',     initials: 'GU' },
];

const useAuthStore = create((set, get) => ({
  user: null,         // { username, role, name, initials }
  loginError: null,

  /**
   * Attempt login. Returns { ok: true } or { ok: false, error: string }
   */
  login: (username, password) => {
    const found = CREDENTIALS.find(
      (c) => c.username === username.trim().toLowerCase() && c.password === password
    );
    if (found) {
      const { password: _p, ...user } = found;
      set({ user, loginError: null });
      return { ok: true, user };
    }
    set({ loginError: 'Invalid username or password' });
    return { ok: false, error: 'Invalid username or password' };
  },

  logout: () => set({ user: null, loginError: null }),

  clearError: () => set({ loginError: null }),

  isLoggedIn: () => !!get().user,

  hasRole: (role) => get().user?.role === role,
}));

export default useAuthStore;
