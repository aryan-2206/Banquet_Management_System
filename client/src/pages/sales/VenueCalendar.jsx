import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

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
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedVenue, setSelectedVenue] = useState('all');

  useEffect(() => {
    api.getBookings()
      .then(res => setBookings(res.bookings || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered =
    selectedVenue === 'all'
      ? bookings
      : bookings.filter(b => b.eventDetails?.venue === selectedVenue);

  return (
    <div style={{ padding: '32px' }}>
      <h1>Venue Calendar</h1>

      <button onClick={() => navigate('/sales')}>← Back</button>

      <div style={{ margin: '16px 0' }}>
        {['all', ...VENUES].map(v => (
          <button key={v} onClick={() => setSelectedVenue(v)}>
            {v}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : filtered.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        filtered
          .sort((a, b) => new Date(a.eventDetails?.date) - new Date(b.eventDetails?.date))
          .map(b => {
            const statusColor = STATUS_COLORS[b.status] || '#999';
            return (
              <div
                key={b._id}
                style={{ border: '1px solid #ccc', padding: 10, marginBottom: 10 }}
                onClick={() => navigate(`/sales/booking/${b._id}`)}
              >
                <p><b>{b.personalDetails?.name}</b></p>
                <p>{b.eventDetails?.venue}</p>
                <p>{b.eventDetails?.guests} guests</p>
                <p style={{ color: statusColor }}>{b.status}</p>
              </div>
            );
          })
      )}
    </div>
  );
}