const Payment = require('../models/Payment');
const Booking = require('../models/Booking');
const { sendPaymentConfirmation } = require('../services/whatsappService');

// @desc  Get all payment records
// GET   /api/payments
const getPayments = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const payments = await Payment.find(query).sort({ createdAt: -1 }).lean();
    res.json({ success: true, count: payments.length, payments });
  } catch (err) {
    next(err);
  }
};

// @desc  Get one payment record
// GET   /api/payments/:id
const getPayment = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('booking').lean();
    if (!payment) return res.status(404).json({ success: false, message: 'Payment record not found' });
    res.json({ success: true, payment });
  } catch (err) {
    next(err);
  }
};

// @desc  Get payment by booking ID
// GET   /api/payments/booking/:bookingId
const getPaymentByBooking = async (req, res, next) => {
  try {
    const payment = await Payment.findOne({ booking: req.params.bookingId }).lean();
    if (!payment) return res.status(404).json({ success: false, message: 'Payment record not found for this booking' });
    res.json({ success: true, payment });
  } catch (err) {
    next(err);
  }
};

// @desc  Record a payment entry
// POST  /api/payments/:id/record
const recordPayment = async (req, res, next) => {
  try {
    const { trancheId, type, amount, utr, mode, date, notes } = req.body;
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment record not found' });

    const entry = { trancheId, type, amount: Number(amount), utr, mode, date: date ? new Date(date) : new Date(), notes, recordedBy: 'Finance Manager' };
    payment.payments.push(entry);

    // Update tranche status if trancheId given
    if (trancheId) {
      const tranche = payment.installmentPlan.tranches.find(t => t.id === trancheId || t._id.toString() === trancheId);
      if (tranche) {
        tranche.status = 'paid';
        tranche.paidAt = new Date();
        tranche.utr = utr;
      }
    }

    // Recalculate status
    const totalPaid = payment.payments.reduce((s, p) => s + p.amount, 0);
    if (totalPaid >= payment.totalValue) {
      payment.status = 'settled';
      payment.settledAt = new Date();
      // Also update the booking status
      await Booking.findByIdAndUpdate(payment.booking, { status: 'completed' });
    } else if (totalPaid >= payment.totalValue * 0.25 && payment.status === 'temporary') {
      payment.status = 'deposit';
      // Update booking
      await Booking.findByIdAndUpdate(payment.booking, { status: 'confirmed' });
      payment.confirmedAt = new Date();
    }

    payment.auditLog.push({ action: 'PAYMENT_RECORDED', actor: 'Finance Manager', details: `₹${amount} recorded via ${mode}${utr ? ` (UTR: ${utr})` : ''}` });
    await payment.save();

    res.json({ success: true, payment, message: `Payment of ₹${amount} recorded successfully` });
  } catch (err) {
    next(err);
  }
};

// @desc  Confirm a booking (flip temporary → confirmed)
// PATCH /api/payments/:id/confirm
const confirmBooking = async (req, res, next) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      { status: 'confirmed', confirmedAt: new Date(), $push: { auditLog: { action: 'BOOKING_CONFIRMED', actor: 'Finance Manager', details: 'Booking manually confirmed' } } },
      { new: true }
    );
    if (!payment) return res.status(404).json({ success: false, message: 'Not found' });
    await Booking.findByIdAndUpdate(payment.booking, { status: 'confirmed' });
    res.json({ success: true, payment });
  } catch (err) {
    next(err);
  }
};

// @desc  Update installment plan
// PUT   /api/payments/:id/installment-plan
const updateInstallmentPlan = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) return res.status(404).json({ success: false, message: 'Not found' });
    payment.installmentPlan = req.body.installmentPlan;
    await payment.save();
    res.json({ success: true, payment });
  } catch (err) {
    next(err);
  }
};

// @desc  Auto-release unpaid temporary bookings (called by cron)
// POST  /api/payments/auto-release
const autoRelease = async (req, res, next) => {
  try {
    const now = new Date();
    const expired = await Payment.find({ status: 'temporary', advanceDeadline: { $lt: now } });
    const ids = expired.map(p => p._id);
    await Payment.updateMany({ _id: { $in: ids } }, { status: 'cancelled' });
    const bookingIds = expired.map(p => p.booking);
    await Booking.updateMany({ _id: { $in: bookingIds } }, { status: 'cancelled' });
    res.json({ success: true, released: expired.length });
  } catch (err) {
    next(err);
  }
};

// @desc  Toggle a tranche paid ↔ pending (Finance team manual confirmation)
// PATCH /api/payments/:id/tranche/:trancheIdx/toggle
const toggleTranche = async (req, res, next) => {
  try {
    const { id, trancheIdx } = req.params;
    const idx = parseInt(trancheIdx, 10);

    const payment = await Payment.findById(id);
    if (!payment) return res.status(404).json({ success: false, message: 'Payment record not found' });

    const tranches = payment.installmentPlan?.tranches;
    if (!tranches || idx < 0 || idx >= tranches.length) {
      return res.status(400).json({ success: false, message: 'Invalid tranche index' });
    }

    const tranche = tranches[idx];
    const nowPaid = tranche.status !== 'paid';   // toggling TO paid?

    if (nowPaid) {
      tranche.status = 'paid';
      tranche.paidAt = new Date();
    } else {
      // Undo: revert to pending
      tranche.status = 'pending';
      tranche.paidAt = undefined;
    }

    // Recalculate overall payment status
    const totalPaid = tranches
      .filter(t => t.status === 'paid')
      .reduce((sum, t) => sum + t.amount, 0);

    if (totalPaid >= payment.totalValue) {
      payment.status = 'settled';
      payment.settledAt = new Date();
      await Booking.findByIdAndUpdate(payment.booking, { status: 'completed' });
    } else if (totalPaid >= payment.totalValue * 0.30 && payment.status === 'temporary') {
      payment.status = 'deposit';
      payment.confirmedAt = new Date();
      await Booking.findByIdAndUpdate(payment.booking, { status: 'confirmed' });
    } else if (totalPaid === 0 && payment.status !== 'temporary') {
      // If undo brought total back to 0
      payment.status = 'temporary';
    }

    payment.auditLog.push({
      action: nowPaid ? 'TRANCHE_MARKED_PAID' : 'TRANCHE_UNDO_PAID',
      actor: 'Finance Manager',
      details: `${tranche.label} (₹${tranche.amount}) marked as ${nowPaid ? 'PAID' : 'PENDING'} via dashboard toggle`,
    });

    await payment.save();

    // Emit socket event for real-time dashboard update
    const io = req.app.get('io');
    if (io) io.emit('payment:updated', { paymentId: payment._id, status: payment.status });

    // Send WhatsApp confirmation to client (only when marking paid)
    if (nowPaid && payment.clientPhone) {
      const bookingRef = payment.bookingRef || payment._id.toString();
      sendPaymentConfirmation(payment.clientPhone, {
        clientName:   payment.clientName,
        enquiryId:    bookingRef,
        trancheLabel: tranche.label,
        amount:       tranche.amount,
      }).catch(err => console.error('[WhatsApp] confirmation error:', err.message));
    }

    res.json({
      success: true,
      payment,
      message: `${tranche.label} marked as ${nowPaid ? 'PAID ✅' : 'PENDING ⬜'}`,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getPayments, getPayment, getPaymentByBooking,
  recordPayment, confirmBooking, updateInstallmentPlan,
  autoRelease, toggleTranche,
};