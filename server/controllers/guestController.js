const Guest = require('../models/Guest');
const Booking = require('../models/Booking');

// @desc  Get guest list for an event
// GET   /api/guests?bookingId=...
const getGuestList = async (req, res, next) => {
  try {
    const { bookingId, eventId } = req.query;
    if (!bookingId) {
      return res.status(400).json({ success: false, message: 'bookingId is required' });
    }

    const query = { booking: bookingId };
    if (eventId) query.eventId = eventId;

    const guests = await Guest.find(query).lean();
    
    res.json({
      success: true,
      count: guests.length,
      guests
    });
  } catch (err) {
    next(err);
  }
};

// @desc  Add multiple guests
// POST  /api/guests/batch
const addGuestsBatch = async (req, res, next) => {
  try {
    const { bookingId, guests, eventId } = req.body;
    let targetBookingId = bookingId;

    if (!targetBookingId) {
      const activeBooking = await Booking.findOne({ status: 'confirmed' }).sort({ createdAt: -1 });
      if (!activeBooking) return res.status(404).json({ success: false, error: 'No active booking found' });
      targetBookingId = activeBooking._id;
    }

    if (!guests || !Array.isArray(guests)) {
      return res.status(400).json({ success: false, message: 'Invalid payload' });
    }

    // Assign booking ID and event ID to all guests
    const guestsData = guests.map(g => ({
      ...g,
      booking: targetBookingId,
      eventId: eventId || 'ev_001'
    }));

    const inserted = await Guest.insertMany(guestsData);

    // Update total guests count in booking if necessary, though usually it's static
    
    res.status(201).json({
      success: true,
      count: inserted.length,
      guests: inserted
    });
  } catch (err) {
    next(err);
  }
};

// @desc  Update single guest (e.g. RSVP status)
// PUT   /api/guests/:id
const updateGuest = async (req, res, next) => {
  try {
    const guest = await Guest.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!guest) return res.status(404).json({ success: false, message: 'Guest not found' });

    res.json({ success: true, guest });
  } catch (err) {
    next(err);
  }
};

// @desc  Delete single guest
// DELETE /api/guests/:id
const deleteGuest = async (req, res, next) => {
  try {
    const guest = await Guest.findByIdAndDelete(req.params.id);
    if (!guest) return res.status(404).json({ success: false, message: 'Guest not found' });

    res.json({ success: true, message: 'Guest deleted' });
  } catch (err) {
    next(err);
  }
};

// @desc  Check-in guest (GRE marks them as checked in) + notifies Kitchen via Socket
// POST  /api/guests/check-in/:id
const checkInGuest = async (req, res, next) => {
  try {
    const guest = await Guest.findById(req.params.id);
    if (!guest) return res.status(404).json({ success: false, message: 'Guest not found' });

    guest.status    = 'checked-in';
    guest.checkInTime = new Date();
    await guest.save();

    // Count total checked-in for this booking to push real-time to Kitchen
    const arrivedCount = await Guest.countDocuments({
      booking: guest.booking,
      status: 'checked-in',
    });

    // Get expected pax from the associated booking
    const booking = await Booking.findById(guest.booking).select('eventDetails.guests').lean();
    const expectedPax = booking?.eventDetails?.guests || 0;

    // 🔌 Emit to /kitchen namespace — Kitchen Dashboard updates headcount instantly
    const io = req.app.get('io');
    if (io) {
      io.of('/kitchen').emit('headcount:update', {
        bookingId: guest.booking.toString(),
        arrived:   arrivedCount,
        expected:  expectedPax,
        updatedAt: new Date().toISOString(),
      });
    }

    res.json({
      success: true,
      message: `Guest checked in. ${arrivedCount}/${expectedPax} arrived.`,
      guest,
      arrived: arrivedCount,
      expected: expectedPax,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getGuestList, addGuestsBatch, updateGuest, deleteGuest, checkInGuest };

