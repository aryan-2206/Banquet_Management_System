import React from 'react';

export default function Notifications({ items = [] }) {
  if (!items.length) return null;
  return (
    <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      {items.map((n, i) => (
        <div key={i} style={{
          background: 'rgba(14,14,26,0.95)', border: '1px solid rgba(201,168,76,0.3)',
          borderRadius: 10, padding: '12px 18px', color: '#F5F0E8', fontSize: 13,
          boxShadow: '0 4px 20px rgba(0,0,0,0.4)', backdropFilter: 'blur(12px)',
          maxWidth: 320,
        }}>
          <div style={{ color: '#C9A84C', fontWeight: 600, marginBottom: 2 }}>{n.title || 'Notification'}</div>
          <div style={{ color: '#9D9880' }}>{n.message}</div>
        </div>
      ))}
    </div>
  );
}
