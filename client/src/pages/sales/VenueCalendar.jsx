import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import useBookingStore from '../../store/bookingSlice';

const VENUES = [
  'Grand Ballroom',
  'Terrace Garden',
  'Crystal Hall',
  'Banquet Suite A',
  'Rooftop Lounge',
  'Garden Pavilion'
];

const STATUS_COLORS = {
  enquiry: '#5B8FE8',
  confirmed: '#5FBF8A',
  temporary: '#9B6DE8',
  cancelled: '#E85555',
  completed: '#C9A84C'
};

export default function VenueCalendar() {
  const navigate = useNavigate();
  const { bookings, fetchBookings, loading } = useBookingStore();
  const [selectedVenue, setSelectedVenue] = useState('all');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const filtered = useMemo(() => {
    let list = selectedVenue === 'all' ? bookings : bookings.filter(b => b.venue === selectedVenue);
    // only show non-cancelled for calendar? Or show all
    return list.filter(b => b.date && b.status !== 'cancelled');
  }, [bookings, selectedVenue]);

  return (
    <div style={{ padding: '40px 24px', maxWidth: 1000, margin: '0 auto', color: '#F5F0E8', fontFamily: 'Outfit, sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <button onClick={() => navigate('/sales')} style={{ background: 'none', border: 'none', color: '#C9A84C', cursor: 'pointer', padding: 0, marginBottom: 8 }}>← Back to Sales</button>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2.5rem', margin: 0, fontWeight: 700 }}>Venue Calendar</h1>
        </div>
      </header>

      <div style={{ display: 'flex', gap: 12, marginBottom: 32, flexWrap: 'wrap' }}>
        <button
          onClick={() => setSelectedVenue('all')}
          style={{ padding: '8px 16px', borderRadius: 20, border: '1px solid rgba(201, 168, 76, 0.3)', background: selectedVenue === 'all' ? '#C9A84C' : 'rgba(255,255,255,0.05)', color: selectedVenue === 'all' ? '#080810' : '#F5F0E8', cursor: 'pointer' }}
        >
          All Venues
        </button>
        {VENUES.map(v => (
          <button
            key={v}
            onClick={() => setSelectedVenue(v)}
            style={{ padding: '8px 16px', borderRadius: 20, border: '1px solid rgba(201, 168, 76, 0.3)', background: selectedVenue === v ? '#C9A84C' : 'rgba(255,255,255,0.05)', color: selectedVenue === v ? '#080810' : '#F5F0E8', cursor: 'pointer', transition: 'all 0.2s' }}
          >
            {v}
          </button>
        ))}
      </div>

      <div style={{ background: '#0E0E1A', border: '1px solid rgba(201, 168, 76, 0.15)', borderRadius: 16, padding: 24 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#9D9880' }}>Loading calendar data...</div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#9D9880' }}>No bookings found for the selected venue.</div>
        ) : (
          <div style={{ display: 'grid', gap: 16 }}>
            {filtered
              .sort((a, b) => new Date(a.date) - new Date(b.date))
              .map(b => (
              <div
                key={b._id}
                onClick={() => navigate(`/sales/booking/${b._id}`)}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: '16px 20px', cursor: 'pointer', transition: 'all 0.2s'
                }}
                onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: STATUS_COLORS[b.status] || '#999' }} />
                    <h3 style={{ margin: 0, fontSize: 18 }}>{b.partyName}</h3>
                  </div>
                  <div style={{ fontSize: 13, color: '#9D9880', marginLeft: 22 }}>
                    {new Date(b.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })} • {b.startTime || 'TBD'} • {b.venue} • {b.pax} pax
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.1em', color: STATUS_COLORS[b.status] || '#999', fontWeight: 600, padding: '4px 8px', background: `${STATUS_COLORS[b.status]}15`, borderRadius: 8, display: 'inline-block' }}>
                    {b.status}
                  </div>
                  <div style={{ fontSize: 12, color: '#9D9880', marginTop: 8 }}>{b.clientName}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}