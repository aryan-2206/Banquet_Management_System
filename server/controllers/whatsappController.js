/**
 * whatsappController.js
 *
 * Handles ALL inbound WhatsApp messages from Twilio.
 *
 * Conversation State Machine (per phone number, in-memory):
 *   IDLE             → default, listen for payment keywords
 *   AWAITING_GUESTS  → full payment done, waiting for guest phone number list
 *
 * Payment keyword detection:
 *   "paid 30%"  / "paid advance"     / "paid 1st" / "paid first"   → tranche 1
 *   "paid 50%"  / "paid 2nd"         / "paid second"               → tranche 2
 *   "paid 20%"  / "paid 3rd"         / "paid third" / "paid full"
 *               / "paid final"       / "paid event day"            → tranche 3 (triggers guest collection)
 *   plain "PAID" / "YES" / "DONE"                                  → oldest pending tranche
 */

const Payment  = require('../models/Payment');
const Booking  = require('../models/Booking');
const twiml    = require('twilio').twiml;
const qrService = require('../services/qrService');
const {
  sendGuestQRWithDJCode,
  askForGuestList,
} = require('../services/whatsappService');

// ── Conversation state store ─────────────────────────────────────────────────
// Map<phone10, { state: 'IDLE'|'AWAITING_GUESTS', bookingId, paymentId, eventName, djRoomCode, eventDate, venue }>
const convState = new Map();

// ── Helpers ──────────────────────────────────────────────────────────────────

/** Normalise a phone string to the last 10 digits */
function phone10(raw = '') {
  return String(raw).replace(/\D/g, '').slice(-10);
}

/** Parse all 10-digit mobile numbers from a free-text message */
function parsePhoneNumbers(text = '') {
  // Match any sequence of 10 digits that looks like an Indian mobile number
  const matches = text.match(/\b[6-9]\d{9}\b/g);
  if (!matches) return [];
  // Deduplicate
  return [...new Set(matches)];
}

/** Detect WHICH tranche the client is referring to */
function detectTranche(body = '') {
  const b = body.toLowerCase();

  // Full payment / final / all done
  const isFullPayment =
    /paid\s*(full|final|all|everything|event\s*day|3rd|third|20\s*%|on\s*event)/i.test(b) ||
    /full\s*(payment|amount|paid)/i.test(b);
  if (isFullPayment) return 'full';

  // Tranche 1 — 30% advance
  if (/\b(30\s*%|advance|1st|first)\b/i.test(b)) return 'tranche1';

  // Tranche 2 — 50% pre-event
  if (/\b(50\s*%|2nd|second|pre.?event)\b/i.test(b)) return 'tranche2';

  // Generic PAID / YES / DONE / CONFIRM
  if (/\b(paid|yes|done|confirm|payment\s*done|received)\b/i.test(b)) return 'auto';

  return null;
}

/** Mark a specific tranche (or auto = oldest pending) and return updated payment */
async function markTranche(payment, trancheKey) {
  let tranche;

  if (trancheKey === 'tranche1') {
    tranche = payment.installmentPlan.tranches.find(
      t => /30%|advance/i.test(t.label) && t.status !== 'paid'
    );
  } else if (trancheKey === 'tranche2') {
    tranche = payment.installmentPlan.tranches.find(
      t => /50%|pre.event/i.test(t.label) && t.status !== 'paid'
    );
  } else if (trancheKey === 'full') {
    // Mark ALL remaining tranches as paid
    let marked = false;
    for (const t of payment.installmentPlan.tranches) {
      if (t.status !== 'paid') {
        t.status = 'paid';
        t.paidAt = new Date();
        t.mode   = 'UPI';
        marked   = true;
      }
    }
    if (!marked) return { alreadyPaid: true, tranche: null };
    tranche = { label: 'Full Payment', amount: payment.totalValue };
  } else {
    // auto — oldest pending
    tranche = payment.installmentPlan.tranches.find(
      t => t.status === 'pending' || t.status === 'overdue'
    );
  }

  if (!tranche) return { alreadyPaid: true, tranche: null };

  if (trancheKey !== 'full') {
    tranche.status = 'paid';
    tranche.paidAt = new Date();
    tranche.mode   = 'UPI';
  }

  return { alreadyPaid: false, tranche };
}

/** Recalculate and persist payment + booking statuses */
async function recalcStatus(payment) {
  const allPaid = payment.installmentPlan.tranches.every(t => t.status === 'paid');
  const totalPaidAmt = payment.installmentPlan.tranches
    .filter(t => t.status === 'paid')
    .reduce((s, t) => s + t.amount, 0);

  let newPaymentStatus = payment.status;
  let newBookingStatus = null;

  if (allPaid) {
    newPaymentStatus = 'settled';
    payment.settledAt = new Date();
    newBookingStatus = 'completed';
  } else if (totalPaidAmt >= payment.totalValue * 0.30 && payment.status === 'temporary') {
    newPaymentStatus = 'deposit';
    payment.confirmedAt = new Date();
    newBookingStatus = 'confirmed';
  } else if (totalPaidAmt >= payment.totalValue * 0.80) {
    newPaymentStatus = 'confirmed';
    newBookingStatus = 'confirmed';
  }

  if (newPaymentStatus !== payment.status) payment.status = newPaymentStatus;

  payment.auditLog.push({
    action: 'PAYMENT_VIA_WHATSAPP',
    actor: payment.clientName,
    details: `Self-confirmed via WhatsApp. New status: ${newPaymentStatus}`,
  });

  await payment.save();

  let booking = null;
  if (newBookingStatus) {
    booking = await Booking.findByIdAndUpdate(
      payment.booking,
      { status: newBookingStatus, updatedAt: new Date() },
      { new: true }
    );
  } else {
    booking = await Booking.findById(payment.booking);
  }

  return { allPaid, newPaymentStatus, newBookingStatus, booking };
}

// ── POST /api/whatsapp/send  (legacy stub) ───────────────────────────────────
const sendNotification = async (req, res, next) => {
  try {
    const { phone, type, data } = req.body;
    console.log(`📱 [WhatsApp] "${type}" queued for ${phone}:`, data);
    res.json({
      success: true,
      message: `WhatsApp ${type} message queued for ${phone}`,
      timestamp: new Date().toISOString(),
    });
  } catch (err) { next(err); }
};

// ── POST /api/whatsapp/inbound  (Twilio webhook) ──────────────────────────────
const handleInbound = async (req, res, next) => {
  const msgSvc = new twiml.MessagingResponse();

  try {
    const rawBody = (req.body.Body || '').trim();
    const from    = phone10(req.body.From || '');

    const io = req.app.get('io');

    // ── STEP A: Are we in AWAITING_GUESTS state for this phone? ──────────────
    const state = convState.get(from);

    if (state?.state === 'AWAITING_GUESTS') {
      const numbers = parsePhoneNumbers(rawBody);

      if (numbers.length === 0) {
        msgSvc.message(
          '📋 Please send valid 10-digit Indian mobile numbers (e.g. 9876543210), comma-separated or one per line.\n\nOr type *SKIP* to skip sending QR codes.'
        );
        res.type('text/xml').send(msgSvc.toString());
        return;
      }

      if (/skip/i.test(rawBody)) {
        convState.delete(from);
        msgSvc.message('✅ QR code sending skipped. Your booking is confirmed. See you at the event! 🎉');
        res.type('text/xml').send(msgSvc.toString());
        return;
      }

      // Fetch booking to get event details + DJ code
      const booking = await Booking.findById(state.bookingId);
      const serverBase = process.env.SERVER_BASE_URL || `http://localhost:${process.env.PORT || 5001}`;

      let sent = 0;
      let failed = 0;

      for (const guestPhone of numbers) {
        try {
          // Generate unique QR for each guest
          const qrResult = await qrService.generateQRCode({
            entityType: 'Guest',
            entityId:   state.bookingId,
            familyMembers: 1,
            data: {
              name:      `Guest-${guestPhone.slice(-4)}`,
              eventName: state.eventName,
              eventDate: state.eventDate,
              bookingId: state.bookingId,
              phone:     guestPhone,
            },
            phone: null, // we'll send manually below with DJ code
            serverBaseUrl: serverBase,
          });

          // Send QR + DJ room code to guest
          await sendGuestQRWithDJCode(guestPhone, {
            guestName:  `Guest`,
            eventName:  state.eventName,
            eventDate:  state.eventDate,
            venue:      state.venue,
            djRoomCode: state.djRoomCode,
            qrImageUrl: qrResult.qrPublicUrl,
          });

          sent++;
          console.log(`✅ QR sent to guest ${guestPhone} for booking ${state.bookingId}`);
        } catch (err) {
          console.error(`❌ QR send failed for ${guestPhone}:`, err.message);
          failed++;
        }
      }

      // Emit to GRE dashboard
      if (io) {
        io.emit('qr:batch_sent', {
          bookingId:  state.bookingId,
          enquiryId:  booking?.enquiryId,
          guestCount: sent,
          eventName:  state.eventName,
        });
      }

      // Mark QRs as sent on booking
      await Booking.findByIdAndUpdate(state.bookingId, { guestQRsSent: true });

      // Clear state
      convState.delete(from);

      const failNote = failed > 0 ? `\n⚠️ ${failed} number(s) could not be reached.` : '';
      msgSvc.message(
        `✅ Done! *${sent} QR entry pass${sent !== 1 ? 'es' : ''}* sent to your guests with their DJ room code.${failNote}\n\nSee you at the event! 🎊`
      );
      res.type('text/xml').send(msgSvc.toString());
      return;
    }

    // ── STEP B: Detect payment keyword ───────────────────────────────────────
    const trancheKey = detectTranche(rawBody);

    if (!trancheKey) {
      // Unknown message — send helpful reply
      msgSvc.message(
        '👋 Hi! Reply with your payment status to update your booking:\n\n• *Paid 30%* — 30% advance\n• *Paid 50%* — Pre-event instalment\n• *Paid full* — Final / full payment\n\nFor other queries, please call us directly.'
      );
      res.type('text/xml').send(msgSvc.toString());
      return;
    }

    // ── STEP C: Find active payment for this phone ────────────────────────────
    const payment = await Payment.findOne({
      clientPhone: { $regex: from },
      status: { $in: ['temporary', 'deposit', 'confirmed'] },
    }).sort({ createdAt: -1 });

    if (!payment) {
      msgSvc.message('❓ We could not find an active booking for your number. Please contact us directly.');
      res.type('text/xml').send(msgSvc.toString());
      return;
    }

    // ── STEP D: Mark tranche paid ─────────────────────────────────────────────
    const { alreadyPaid, tranche } = await markTranche(payment, trancheKey);

    if (alreadyPaid) {
      msgSvc.message(`✅ All instalments are already marked as paid for booking *${payment.bookingRef}*. Thank you!`);
      res.type('text/xml').send(msgSvc.toString());
      return;
    }

    // ── STEP E: Recalculate statuses and save ─────────────────────────────────
    const { allPaid, newPaymentStatus, newBookingStatus, booking } = await recalcStatus(payment);

    // ── STEP F: Emit real-time Socket.io events ──────────────────────────────
    if (io) {
      // Finance dashboard
      const totalPaidNow = payment.installmentPlan.tranches
        .filter(t => t.status === 'paid')
        .reduce((s, t) => s + t.amount, 0);

      io.emit('payment:updated', {
        paymentId:    payment._id.toString(),
        bookingId:    payment.booking.toString(),
        bookingRef:   payment.bookingRef,
        status:       newPaymentStatus,
        tranchePaid:  tranche.label,
        amountPaid:   tranche.amount,
        totalPaid:    totalPaidNow,
        outstanding:  Math.max(0, payment.totalValue - totalPaidNow),
        totalValue:   payment.totalValue,
        clientName:   payment.clientName,
      });

      // Sales dashboard
      if (newBookingStatus) {
        io.emit('booking:statusChanged', {
          bookingId:    payment.booking.toString(),
          enquiryId:    payment.bookingRef,
          oldStatus:    booking?.status || 'enquiry',
          newStatus:    newBookingStatus,
          clientName:   payment.clientName,
          eventDate:    payment.eventDate,
          tranchePaid:  tranche.label,
        });
      }
    }

    // ── STEP G: Build WhatsApp reply ──────────────────────────────────────────
    if (allPaid) {
      // Full payment — transition to AWAITING_GUESTS state
      const eventName = `${payment.hall || 'your event'} – ${payment.bookingRef}`;
      const djRoomCode = booking?.djRoomCode || 'DJ-????';

      convState.set(from, {
        state:     'AWAITING_GUESTS',
        bookingId: payment.booking.toString(),
        paymentId: payment._id.toString(),
        eventName,
        djRoomCode,
        eventDate: payment.eventDate,
        venue:     payment.hall || '',
      });

      // Ask for guest list
      await askForGuestList(payment.clientPhone, {
        clientName: payment.clientName,
        enquiryId:  payment.bookingRef,
        eventName,
      });

      // TwiML response is minimal since we already sent the full message above
      msgSvc.message('✅ Full payment received! Check your WhatsApp for the next step — please send your guest numbers.');
    } else {
      // Partial payment — reply with next instalment info
      const remaining = payment.installmentPlan.tranches.filter(
        t => t.status === 'pending' || t.status === 'overdue'
      );

      let reply =
        `✅ *Payment Confirmed!* – ${payment.bookingRef}\n\n` +
        `Hi ${payment.clientName}, your *${tranche.label}* payment of *₹${tranche.amount.toLocaleString('en-IN')}* has been recorded. Thank you!\n\n`;

      if (remaining.length > 0) {
        const next    = remaining[0];
        const nextDue = new Date(next.dueDate).toLocaleDateString('en-IN', { dateStyle: 'medium' });
        reply +=
          `📋 *Next instalment:*\n${next.label} – ₹${next.amount.toLocaleString('en-IN')}\nDue: ${nextDue}\n\n` +
          `Reply *Paid full* or *Paid ${next.pct}%* once done.`;
      }

      msgSvc.message(reply);
    }

    res.type('text/xml').send(msgSvc.toString());
  } catch (err) {
    console.error('[Inbound WhatsApp] Error:', err.message);
    const errSvc = new twiml.MessagingResponse();
    errSvc.message('Sorry, we had a technical issue. Please call us directly.');
    res.type('text/xml').send(errSvc.toString());
  }
};

module.exports = { sendNotification, handleInbound };
