const Booking = require('../models/Booking');

// @desc  Get kitchen events (active bookings for today/upcoming)
// GET   /api/kitchen/events
const getKitchenEvents = async (req, res, next) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const upcoming = new Date(today);
    upcoming.setDate(today.getDate() + 7);

    const events = await Booking.find({
      'eventDetails.date': { $gte: today, $lte: upcoming },
      status: { $nin: ['cancelled', 'enquiry'] },
    }).select('enquiryId personalDetails.name eventDetails costEstimate status menuSelection').lean();

    res.json({
      success: true,
      count: events.length,
      events
    });
  } catch (err) {
    next(err);
  }
};

// @desc  Get live headcount for a specific event
// GET   /api/kitchen/live-pax/:id
const getLiveHeadcount = async (req, res, next) => {
  // Headcount is pushed via sockets, but this provides a fallback or audit trail if we log it
  try {
    const booking = await Booking.findById(req.params.id).select('enquiryId eventDetails.guests status').lean();
    if (!booking) return res.status(404).json({ success: false, message: 'Event not found' });
    
    res.json({
      success: true,
      data: {
        enquiryId: booking.enquiryId,
        plannedPax: booking.eventDetails.guests,
        status: booking.status
      }
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getKitchenEvents, getLiveHeadcount };
