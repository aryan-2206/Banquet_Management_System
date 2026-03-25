import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useFinanceStore from './useFinanceStore';
import { formatINR } from './useInstallmentLogic';

const Icon = ({ d, size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const ICONS = {
  back: 'M19 12H5M12 5l-7 7 7 7',
};

export default function InstallmentBuilder() {
  const navigate = useNavigate();
  const bookings = useFinanceStore((s) => s.bookings);

  // Filter only bookings that have an instalment plan
  // Optionally filter out 'cancelled' or put completed ones at the bottom.
  const activeBookings = bookings
    .filter(b => b.installmentPlan?.tranches?.length > 0 && b.status !== 'cancelled')
    .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate)); // Sort by upcoming events

  return (
    <div className="ib-root" style={{ overflowY: 'auto', height: '100vh', background: '#12110e' }}>
       <div className="ib-header" style={{ padding: '32px 32px 16px' }}>
         <button className="pl-back" onClick={() => navigate('/finance')} style={{ background: 'transparent', border: 'none', color: '#9D9880', display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', marginBottom: 16 }}>
            <Icon d={ICONS.back} size={16} /> Dashboard
         </button>
         <div>
            <h1 style={{ margin: 0, fontSize: 28, color: '#F5F0E8', fontWeight: 500 }}>All Installment Plans</h1>
            <p style={{ margin: '4px 0 0', color: '#9D9880' }}>Monitor and update client payment tranches globally</p>
         </div>
       </div>

       <div style={{ padding: '0 32px 40px' }}>
          {activeBookings.length === 0 ? (
             <div className="glass" style={{ padding: 40, textAlign: 'center', marginTop: 24, borderRadius: 12 }}>
               <h3 style={{ color: '#F5F0E8', margin: 0 }}>No active installment plans found</h3>
               <p style={{ color: '#9D9880', margin: '8px 0 0' }}>Sales bookings will appear here automatically.</p>
             </div>
          ) : activeBookings.map(b => (
             <div key={b.id} className="glass animate-fade-up" style={{ marginTop: 24, padding: 24, borderRadius: 12, background: 'linear-gradient(145deg, rgba(28, 27, 24, 0.45) 0%, rgba(20, 19, 17, 0.6) 100%)', border: '1px solid rgba(201, 168, 76, 0.15)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                   <div>
                     <h2 style={{ margin: '0 0 4px', fontSize: 20, color: '#F5F0E8', fontWeight: 500 }}>{b.clientName}</h2>
                     <span style={{ color: '#9D9880', fontSize: 13 }}>{b.bookingRef || b.id} · {new Date(b.eventDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })} · <strong>Total: {formatINR(b.totalValue)}</strong></span>
                   </div>
                   <span className={`badge-finance badge-finance--${b.status==='overdue'?'overdue':b.status==='completed'?'settled':b.status==='confirmed'?'settled':'temporary'}`}>
                     {b.status.toUpperCase()}
                   </span>
                </div>

                <div className="pl-table-section" style={{ overflowX: 'auto' }}>
                  <table className="pl-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', background: 'rgba(20,19,17,0.8)', borderRadius: 8, overflow: 'hidden' }}>
                    <thead style={{ background: 'rgba(201,168,76,0.1)', borderBottom: '1px solid rgba(201,168,76,0.2)' }}>
                      <tr>
                        <th style={{ padding: '12px 16px', color: '#C9A84C', fontWeight: 500, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Instalment Phase</th>
                        <th style={{ padding: '12px 16px', color: '#C9A84C', fontWeight: 500, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Due Date</th>
                        <th style={{ padding: '12px 16px', color: '#C9A84C', fontWeight: 500, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Amount</th>
                        <th style={{ padding: '12px 16px', color: '#C9A84C', fontWeight: 500, fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {b.installmentPlan.tranches.map((t, i) => {
                        const isPaid = t.status === 'paid';
                        const isOverdue = t.status === 'overdue';
                        return (
                          <tr key={i} style={{ borderBottom: '1px solid rgba(245,240,232,0.05)', background: isPaid ? 'rgba(95,191,138,0.05)' : 'transparent' }}>
                            <td style={{ padding: '16px', fontWeight: 500, color: '#F5F0E8' }}>{t.label}</td>
                            <td style={{ padding: '16px', color: '#9D9880' }}>
                                {new Date(t.dueDate).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                                {isOverdue && <span style={{ color: '#E85555', marginLeft: 8, fontSize: 12, fontWeight: 500 }}>⚠ Overdue</span>}
                            </td>
                            <td style={{ padding: '16px', color: '#F5F0E8', fontFamily: 'monospace', fontSize: 15 }}>{formatINR(t.amount)}</td>
                            <td style={{ padding: '16px', fontWeight: 600, fontSize: 13, letterSpacing: '0.04em', color: isPaid ? '#5FBF8A' : isOverdue ? '#E85555' : '#E8C455' }}>
                                {t.status.toUpperCase()}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
             </div>
          ))}
       </div>
    </div>
  );
}
