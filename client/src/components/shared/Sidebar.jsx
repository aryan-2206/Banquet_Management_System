import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import './Sidebar.css';

const NAV = [
  {
    group: 'Sales',
    items: [
      { to: '/sales',           icon: '◈', label: 'Dashboard' },
      { to: '/sales/new',       icon: '＋', label: 'New Booking' },
      { to: '/sales/calendar',  icon: '▦', label: 'Venue Calendar' },
    ],
  },
  {
    group: 'Finance',
    items: [
      { to: '/finance',         icon: '◎', label: 'Finance Hub' },
      { to: '/finance/ledger',  icon: '≡', label: 'Payment Ledger' },
      { to: '/finance/gst',     icon: '%', label: 'GST Reports' },
    ],
  },
  {
    group: 'Operations',
    items: [
      { to: '/kitchen',         icon: '⊕', label: 'Kitchen' },
      { to: '/gre',             icon: '⊙', label: 'GRE Check-in' },
      { to: '/dj',              icon: '◉', label: 'DJ Live View' },
    ],
  },
  {
    group: 'Admin',
    items: [
      { to: '/admin',           icon: '⊗', label: 'Admin Panel' },
      { to: '/admin/reports',   icon: '▣', label: 'Reports & Audit' },
    ],
  },
];

export default function Sidebar() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''}`}>
      {/* Wordmark */}
      <div className="sidebar__brand">
        <div className="sidebar__logo">
          <span className="sidebar__logo-mark">B</span>
        </div>
        {!collapsed && (
          <div className="sidebar__name">
            <span className="sidebar__name-main">Banquet</span>
            <span className="sidebar__name-sub">IntelliManager</span>
          </div>
        )}
        <button className="sidebar__toggle" onClick={() => setCollapsed(!collapsed)}>
          {collapsed ? '›' : '‹'}
        </button>
      </div>

      {/* Nav groups */}
      <nav className="sidebar__nav">
        {NAV.map(({ group, items }) => (
          <div className="sidebar__group" key={group}>
            {!collapsed && <span className="sidebar__group-label">{group}</span>}
            {items.map(({ to, icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/sales' || to === '/finance' || to === '/admin'}
                className={({ isActive }) =>
                  `sidebar__item ${isActive ? 'sidebar__item--active' : ''}`
                }
              >
                <span className="sidebar__icon">{icon}</span>
                {!collapsed && <span className="sidebar__label">{label}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* User pill */}
      <div className="sidebar__user">
        <div className="sidebar__avatar">AS</div>
        {!collapsed && (
          <div className="sidebar__user-info">
            <span className="sidebar__user-name">Aryan Doshi</span>
            <span className="sidebar__user-role">Sales Manager</span>
          </div>
        )}
      </div>
    </aside>
  );
}