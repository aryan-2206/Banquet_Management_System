import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import StatusBadge from '../../components/shared/StatusBadge';
import { BOOKINGS, TIER_COLORS, VENUES, parseBookingDate } from './salesMock';
import './VenueCalendar.css';

function formatDate(d) {
  return d.toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short' });
}

export default function VenueCalendar() {
  const [venue, setVenue] = useState(VENUES[0] ?? '');
  const [query, setQuery] = useState('');

  const rows = useMemo(() => {
    const list = BOOKINGS.filter((b) => (venue ? b.venue === venue : true));
    const withDate = list
      .map((b) => ({ booking: b, dateObj: parseBookingDate(b.date) }))
      .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime());

    const q = query.trim().toLowerCase();
    if (!q) return withDate;

    return withDate.filter(({ booking }) => {
      return (
        booking.party.toLowerCase().includes(q) ||
        booking.client.toLowerCase().includes(q) ||
        booking.id.toLowerCase().includes(q)
      );
    });
  }, [venue, query]);

  return (
    <div className="vc-root">
      <div className="vc-card glass">
        <div className="vc-top">
          <div>
            <div className="vc-kicker">Venue Calendar</div>
            <div className="vc-title">Bookings by venue & date</div>
          </div>
          <Link className="vc-back" to="/sales">
            ← Back to Sales
          </Link>
        </div>

        <div className="vc-controls">
          <div className="vc-control">
            <div className="vc-label">Venue</div>
            <select className="vc-select" value={venue} onChange={(e) => setVenue(e.target.value)}>
              {VENUES.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
          <div className="vc-control vc-control--grow">
            <div className="vc-label">Search</div>
            <input
              className="vc-input"
              placeholder="Search party, client, booking id..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="vc-tableWrap">
          <div className="vc-tableHead">
            <div>Date</div>
            <div>Booking</div>
            <div>Status</div>
            <div>Tier</div>
            <div></div>
          </div>

          {rows.length === 0 && <div className="vc-empty">No bookings match your filters.</div>}

          {rows.map(({ booking, dateObj }) => (
            <div key={booking.id} className="vc-row">
              <div className="vc-date">{formatDate(dateObj)}</div>
              <div className="vc-booking">
                <div className="vc-party">{booking.party}</div>
                <div className="vc-client">
                  {booking.client} · <span className="vc-id">{booking.id}</span>
                </div>
              </div>
              <div className="vc-status">
                <StatusBadge status={booking.status} dot />
              </div>
              <div className="vc-tier">
                <span className="vc-tierPill" style={{ '--tier-color': TIER_COLORS[booking.tier] }}>
                  {booking.tier}
                </span>
              </div>
              <div className="vc-view">
                <Link className="vc-viewBtn" to={`/sales/${booking.id}`}>
                  View →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

