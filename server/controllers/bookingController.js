const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

// Normalise display names → Mongoose enum slugs
const VENUE_MAP = {
  'grand ballroom':  'grand-ballroom',
  'terrace garden':  'terrace-garden',
  'crystal hall':    'crystal-hall',
  'banquet suite a': 'banquet-suite-a',
  'rooftop lounge':  'rooftop-lounge',
  'garden pavilion': 'garden-pavilion',
};
const EVENT_MAP = {
  'wedding reception':  'wedding',
  'birthday party':     'birthday',
  'anniversary party':  'anniversary',
  'corporate event':    'corporate',
  'conference':         'conference',
  'other':              'other',
};

const normalizeVenue = (v = '') => {
  if (!v) return 'grand-ballroom';
  const slug = VENUE_MAP[v.toLowerCase()];
  return slug || v.toLowerCase().replace(/\s+/g, '-');
};

const normalizeEventType = (e = '') => {
  if (!e) return 'other';
  const slug = EVENT_MAP[e.toLowerCase()];
  // If we have a direct match, use it; else try the raw value (it may already be a slug)
  return slug || e.toLowerCase();
};

// @desc  Create new booking enquiry
// POST  /api/bookings
const createBooking = async (req, res, next) => {
  try {
    const {
      partyName, clientName, clientPhone, clientEmail,
      gstNumber, companyName, alternatePhone, address,
      date, startTime, endTime, venue, pax, eventManager, notes, eventType,
      tier, addons,
      subtotal, gst, total,
      decoration, entertainment, photography,
    } = req.body;

    const venueSlug = normalizeVenue(venue);
    const eventSlug = normalizeEventType(eventType);

    // Overlap check: same venue, same date
    const existing = await Booking.findOne({
      'eventDetails.date': new Date(date),
      'eventDetails.venue': venueSlug,
      status: { $nin: ['cancelled'] },
    });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: `${venue} is already booked on ${date}. Please choose a different date or venue.`,
      });
    }

    const booking = await Booking.create({
      personalDetails: {
        name: clientName,
        email: clientEmail,
        phone: clientPhone,
        company: companyName,
        gstNumber,
      },
      eventDetails: {
        eventType: eventSlug,
        guests: Number(pax),
        date: new Date(date),
        time: startTime && endTime ? `${startTime} - ${endTime}` : (startTime || ''),
        venue: venueSlug,
      },
      menuSelection: {
        catering: 'both',
        customRequirements: [
          tier ? `Tier: ${tier}` : '',
          addons?.length ? `Add-ons: ${addons.join(', ')}` : '',
          notes || '',
        ].filter(Boolean).join('. '),
      },
      additionalRequirements: {
        decoration: decoration || 'basic',
        entertainment: entertainment || 'none',
        photography: photography || false,
      },
      costEstimate: {
        menuCost:  subtotal || 0,
        totalCost: total    || 0,
      },
      status: 'enquiry',
    });

    // Also create a Payment record linked to this booking
    const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;
    const advanceDeadline = new Date(Date.now() + TWO_DAYS);
    const preEventDate    = new Date(date); preEventDate.setDate(preEventDate.getDate() - 7);
    const postEventDate   = new Date(date); postEventDate.setDate(postEventDate.getDate() + 3);

    await Payment.create({
      booking: booking._id,
      bookingRef: booking.enquiryId,
      clientName: partyName ? `${partyName} (${clientName})` : clientName,
      clientPhone,
      eventDate: new Date(date),
      hall: venueSlug,
      totalValue: total || 0,
      status: 'temporary',
      advanceDeadline,
      installmentPlan: {
        template: 'standard',
        tranches: [
          { label: '25% Advance (due in 48h)', pct: 25, dueDate: advanceDeadline,  amount: Math.round((total || 0) * 0.25), status: 'pending' },
          { label: '35% Pre-event',            pct: 35, dueDate: preEventDate,     amount: Math.round((total || 0) * 0.35), status: 'pending' },
          { label: '40% Post-event',           pct: 40, dueDate: postEventDate,    amount: Math.round((total || 0) * 0.40), status: 'pending' },
        ],
      },
      auditLog: [{ action: 'BOOKING_CREATED', actor: clientName, details: `New enquiry ${booking.enquiryId} created` }],
    });

    res.status(201).json({
      success: true,
      booking: {
        id: booking._id,
        enquiryId: booking.enquiryId,
        status: booking.status,
        advanceDeadline,
      },
      message: `Enquiry ${booking.enquiryId} created. Advance payment required within 48 hours to secure the booking.`,
    });
  } catch (err) {
    next(err);
  }
};

// @desc  Get all bookings (Sales / Finance view)
// GET   /api/bookings
const getBookings = async (req, res, next) => {
  try {
    const { status, venue, date, page = 1, limit = 20 } = req.query;
    const query = {};
    if (status) query.status = status;
    if (venue) query['eventDetails.venue'] = venue;
    if (date) {
      const d = new Date(date);
      query['eventDetails.date'] = { $gte: d, $lt: new Date(d.getTime() + 86400000) };
    }

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    const total = await Booking.countDocuments(query);
    res.json({ success: true, count: bookings.length, total, bookings });
  } catch (err) {
    next(err);
  }
};

// @desc  Get single booking
// GET   /api/bookings/:id
const getBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).lean();
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};

// @desc  Update booking status
// PATCH /api/bookings/:id/status
const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, booking });
  } catch (err) {
    next(err);
  }
};

// @desc  Check venue availability
// GET   /api/bookings/check-availability
const checkAvailability = async (req, res, next) => {
  try {
    const { date, venue } = req.query;
    if (!date || !venue) return res.status(400).json({ success: false, message: 'date and venue are required' });

    const d = new Date(date);
    const conflict = await Booking.findOne({
      'eventDetails.venue': venue,
      'eventDetails.date': { $gte: d, $lt: new Date(d.getTime() + 86400000) },
      status: { $nin: ['cancelled'] },
    }).select('enquiryId status personalDetails.name');

    res.json({ success: true, available: !conflict, conflict: conflict || null });
  } catch (err) {
    next(err);
  }
};

module.exports = { createBooking, getBookings, getBooking, updateStatus, checkAvailability };