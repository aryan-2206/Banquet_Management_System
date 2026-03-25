import React, { useState } from 'react';
import './VenueCalendar.css';

/* ─── Component ─── */
export default function VenueCalendar({ onClose, onDateSelect }) {
  const [selectedVenue, setSelectedVenue] = useState('grand-ballroom');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  // Mock venue data
  const venues = {
    'grand-ballroom': { name: 'Grand Ballroom', capacity: 500, rate: 150000 },
    'terrace-garden': { name: 'Terrace Garden', capacity: 200, rate: 80000 },
    'crystal-hall': { name: 'Crystal Hall', capacity: 300, rate: 100000 },
    'banquet-suite-a': { name: 'Banquet Suite A', capacity: 150, rate: 60000 },
    'rooftop-lounge': { name: 'Rooftop Lounge', capacity: 100, rate: 50000 }
  };

  const venue = venues[selectedVenue];

  // Mock some booked dates for demonstration
  const mockBookedDates = {
    'grand-ballroom': ['2026-03-28', '2026-04-05', '2026-04-10'],
    'terrace-garden': ['2026-03-30', '2026-04-12'],
    'crystal-hall': ['2026-04-03', '2026-04-15'],
    'banquet-suite-a': ['2026-04-08'],
    'rooftop-lounge': ['2026-04-20']
  };

  // Get days in month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  // Check if date is booked
  const isDateBooked = (day) => {
    if (!day) return false;
    
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    // Format date as YYYY-MM-DD manually to avoid timezone issues
    const monthStr = (month + 1).toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');
    const dateStr = `${year}-${monthStr}-${dayStr}`;
    
    return mockBookedDates[selectedVenue]?.includes(dateStr) || false;
  };

  // Navigate months
  const navigateMonth = (direction) => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(newMonth.getMonth() - 1);
      } else {
        newMonth.setMonth(newMonth.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const handleDateClick = (day) => {
    if (!day) return;
    
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const clickedDate = new Date(year, month, day, 12, 0, 0); // Set time to noon to avoid timezone issues
    
    // Don't allow selecting past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (clickedDate < today) return;
    
    // Don't allow selecting booked dates
    if (isDateBooked(day)) return;
    
    setSelectedDate(clickedDate);
  };

  const handleConfirmDate = () => {
    if (selectedDate) {
      onDateSelect(selectedDate);
      onClose();
    }
  };

  const monthYear = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const days = getDaysInMonth(currentMonth);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="venue-calendar-overlay">
      <div className="venue-calendar-modal">
        <div className="calendar-header">
          <h2>Venue Availability Calendar</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="venue-selector">
          <label>Select Venue:</label>
          <select 
            value={selectedVenue} 
            onChange={(e) => setSelectedVenue(e.target.value)}
          >
            {Object.entries(venues).map(([id, venue]) => (
              <option key={id} value={id}>
                {venue.name} (Capacity: {venue.capacity}, Rate: ₹{venue.rate.toLocaleString()})
              </option>
            ))}
          </select>
        </div>

        <div className="calendar-container">
          <div className="calendar-nav">
            <button onClick={() => navigateMonth('prev')} className="nav-btn">
              ← Previous
            </button>
            <h3>{monthYear}</h3>
            <button onClick={() => navigateMonth('next')} className="nav-btn">
              Next →
            </button>
          </div>

          <div className="calendar-grid">
            {/* Week day headers */}
            {weekDays.map(day => (
              <div key={day} className="calendar-header-day">
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {days.map((day, index) => {
              if (!day) {
                return <div key={`empty-${index}`} className="calendar-day empty" />;
              }

              const year = currentMonth.getFullYear();
              const month = currentMonth.getMonth();
              const currentDate = new Date(year, month, day, 12, 0, 0); // Set time to noon to avoid timezone issues
              const isBooked = isDateBooked(day);
              const today = new Date();
              today.setHours(0, 0, 0, 0);
              const isPast = currentDate < today;
              const isSelected = selectedDate && 
                selectedDate.getDate() === day && 
                selectedDate.getMonth() === month &&
                selectedDate.getFullYear() === year;

              return (
                <div
                  key={day}
                  className={`calendar-day ${isBooked ? 'booked' : ''} ${isPast ? 'past' : ''} ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleDateClick(day)}
                >
                  {day}
                  {isBooked && <span className="booking-indicator">•</span>}
                </div>
              );
            })}
          </div>
        </div>

        {selectedDate && (
          <div className="selected-date-info">
            <h4>Selected Date: {selectedDate.toLocaleDateString('en-IN', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</h4>
            
            <div className="date-bookings">
              <p className="available-message">✅ Venue is available on this date</p>
            </div>
          </div>
        )}

        <div className="calendar-actions">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn-primary" 
            onClick={handleConfirmDate}
            disabled={!selectedDate}
          >
            Confirm Date
          </button>
        </div>
      </div>
    </div>
  );
}
