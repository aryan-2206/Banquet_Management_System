const Booking = require('../models/Booking');

// @desc  Get guest list for an event (for GRE)
// GET   /api/guests
const getGuestList = async (req, res, next) => {
  try {
    const { bookingId, status } = req.query;
    const query = {};
    if (bookingId) query._id = bookingId;
    if (status) query.status = status;

    const bookings = await Booking.find(query).select('enquiryId personalDetails eventDetails status costEstimate').lean();

    res.json({
      success: true,
      count: bookings.length,
      guests: bookings
    });
  } catch (err) {
    next(err);
  }
};

// @desc  Check-in guest (updates status or timeline)
// POST  /api/guests/check-in/:id
const checkInGuest = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });

    booking.timeline.push({
      action: 'GUEST_CHECKED_IN',
      timestamp: new Date(),
      details: `Guest check-in recorded by GRE`
    });

    await booking.save();

    res.json({
      success: true,
      message: 'Guest check-in recorded successfully',
      booking
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getGuestList, checkInGuest };
