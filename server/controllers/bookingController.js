const Booking = require('../models/Booking');
const Payment = require('../models/Payment');
const { sendInstallmentPlan } = require('../services/whatsappService');

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
      preEventInstallmentDate,   // client-chosen date for 50% tranche
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

    // ── Instalment plan dates ──────────────────────────────────────────────
    const TWO_DAYS        = 2 * 24 * 60 * 60 * 1000;
    const advanceDeadline = new Date(Date.now() + TWO_DAYS);   // 30% due in 48h
    const eventDate       = new Date(date);

    // 50%: use client-chosen date if provided, else default 7 days pre-event
    let preEventDate;
    if (preEventInstallmentDate) {
      preEventDate = new Date(preEventInstallmentDate);
    } else {
      preEventDate = new Date(eventDate);
      preEventDate.setDate(preEventDate.getDate() - 7);
    }

    // 20%: on event day itself
    const onEventDate = new Date(eventDate);

    const grandTotal = total || 0;
    const amt30 = Math.round(grandTotal * 0.30);
    const amt50 = Math.round(grandTotal * 0.50);
    const amt20 = grandTotal - amt30 - amt50;  // remainder avoids rounding gaps

    const payment = await Payment.create({
      booking: booking._id,
      bookingRef: booking.enquiryId,
      clientName: partyName ? `${partyName} (${clientName})` : clientName,
      clientPhone,
      eventDate,
      hall: venueSlug,
      totalValue: grandTotal,
      status: 'temporary',
      advanceDeadline,
      preEventInstallmentDate: preEventDate,
      installmentPlan: {
        template: 'standard',
        tranches: [
          {
            label: '30% Advance (due within 48h)',
            pct: 30, dueDate: advanceDeadline,
            amount: amt30, status: 'pending', remindersSent: [],
          },
          {
            label: '50% Pre-Event Instalment',
            pct: 50, dueDate: preEventDate,
            amount: amt50, status: 'pending', remindersSent: [],
          },
          {
            label: '20% On Event Day',
            pct: 20, dueDate: onEventDate,
            amount: amt20, status: 'pending', remindersSent: [],
          },
        ],
      },
      auditLog: [{
        action: 'BOOKING_CREATED',
        actor: clientName,
        details: `New enquiry ${booking.enquiryId} created`,
      }],
    });

    // ── Send WhatsApp notification ─────────────────────────────────────────
    if (clientPhone) {
      sendInstallmentPlan(clientPhone, {
        enquiryId:  booking.enquiryId,
        clientName,
        eventType:  eventType || eventSlug,
        eventDate,
        venue:      venue || venueSlug,
        pax:        Number(pax),
        totalValue: grandTotal,
        tranche1: { amount: amt30, dueDate: advanceDeadline },
        tranche2: { amount: amt50, dueDate: preEventDate },
        tranche3: { amount: amt20, dueDate: onEventDate },
      }).catch(err => console.error('[WhatsApp] send error:', err.message));
    }

    res.status(201).json({
      success: true,
      booking: {
        id: booking._id,
        enquiryId: booking.enquiryId,
        status: booking.status,
        advanceDeadline,
        preEventInstallmentDate: preEventDate,
      },
      payment: {
        id: payment._id,
        tranches: payment.installmentPlan.tranches.map(t => ({
          label: t.label, pct: t.pct, amount: t.amount, dueDate: t.dueDate,
        })),
      },
      message: `Enquiry ${booking.enquiryId} created. 30% advance required within 48 hours. WhatsApp confirmation sent to ${clientPhone}.`,
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