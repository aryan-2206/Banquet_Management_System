import React, { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';

import StatusBadge from '../../components/shared/StatusBadge';
import { BOOKINGS, TIER_COLORS, parseBookingDate } from './salesMock';
import './BookingDetail.css';

export default function BookingDetail() {
  const { bookingId } = useParams();

  const booking = useMemo(() => BOOKINGS.find((b) => b.id === bookingId), [bookingId]);

  if (!booking) {
    return (
      <div className="bd-root">
        <div className="bd-card glass">
          <div className="bd-title">Booking not found</div>
          <div className="bd-sub">Unknown booking id: {bookingId}</div>
          <Link className="bd-back" to="/sales">
            ← Back to Sales Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const d = parseBookingDate(booking.date);
  const pretty = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="bd-root">
      <div className="bd-card glass">
        <div className="bd-top">
          <div>
            <div className="bd-kicker">Booking Details</div>
            <div className="bd-id">{booking.id}</div>
          </div>
          <Link className="bd-back" to="/sales">
            ← Back
          </Link>
        </div>

        <div className="bd-grid">
          <div className="bd-field">
            <div className="bd-label">Party</div>
            <div className="bd-value">{booking.party}</div>
          </div>
          <div className="bd-field">
            <div className="bd-label">Client</div>
            <div className="bd-value">{booking.client}</div>
          </div>
          <div className="bd-field">
            <div className="bd-label">Date</div>
            <div className="bd-value">{pretty}</div>
          </div>
          <div className="bd-field">
            <div className="bd-label">Venue</div>
            <div className="bd-value">{booking.venue}</div>
          </div>
          <div className="bd-field">
            <div className="bd-label">Pax</div>
            <div className="bd-value">
              {booking.pax} <span className="bd-muted">guests</span>
            </div>
          </div>
          <div className="bd-field">
            <div className="bd-label">Tier</div>
            <div className="bd-value">
              <span className="bd-tier" style={{ '--tier-color': TIER_COLORS[booking.tier] }}>
                {booking.tier}
              </span>
            </div>
          </div>
          <div className="bd-field">
            <div className="bd-label">Status</div>
            <div className="bd-value">
              <StatusBadge status={booking.status} dot />
            </div>
          </div>
          <div className="bd-field">
            <div className="bd-label">Manager</div>
            <div className="bd-value">{booking.manager}</div>
          </div>
        </div>

        <div className="bd-actions">
          <Link className="bd-action bd-action--primary" to="/sales/new">
            + Create another booking
          </Link>
          <Link className="bd-action bd-action--outline" to="/sales/calendar">
            View venue calendar
          </Link>
        </div>
      </div>
    </div>
  );
}

