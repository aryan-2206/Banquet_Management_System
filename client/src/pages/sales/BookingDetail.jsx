import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';

const STATUS_COLORS = {
  enquiry: '#5B8FE8',
  confirmed: '#5FBF8A',
  temporary: '#9B6DE8',
  'pending-payment': '#E8C455',
  cancelled: '#E85555',
  completed: '#C9A84C',
};

export default function BookingDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setError('No booking ID provided');
      setLoading(false);
      return;
    }

    api.getBookings()
      .then(res => {
        const found = res.bookings?.find(
          b => b._id === id || b.enquiryId === id
        );
        setBooking(found || null);
        if (!found) setError('Booking not found');
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div style={{ padding: 48, textAlign: 'center' }}>Loading booking details…</div>;
  }

  if (error || !booking) {
    return (
      <div style={{ padding: 48, textAlign: 'center', color: 'red' }}>
        <p>{error || 'Booking not found.'}</p>
        <button onClick={() => navigate('/sales')}>← Back to Sales</button>
      </div>
    );
  }

  const statusColor = STATUS_COLORS[booking.status] || '#999';

  return (
    <div style={{ padding: 32 }}>
      <button onClick={() => navigate('/sales')}>← Back</button>

      <h1>{booking.personalDetails?.name}</h1>
      <p>{booking.enquiryId}</p>

      <p>Status: <span style={{ color: statusColor }}>{booking.status}</span></p>

      <h3>Client Info</h3>
      <p>{booking.personalDetails?.email}</p>
      <p>{booking.personalDetails?.phone}</p>

      <h3>Event</h3>
      <p>{booking.eventDetails?.eventType}</p>
      <p>{booking.eventDetails?.venue}</p>
      <p>{booking.eventDetails?.guests} guests</p>
    </div>
  );
}