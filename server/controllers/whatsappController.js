const Payment  = require('../models/Payment');
const Booking  = require('../models/Booking');
const twiml    = require('twilio').twiml;
const { sendPaymentConfirmation } = require('../services/whatsappService');

// ── POST /api/whatsapp/send  (legacy stub) ───────────────────────────────────
const sendNotification = async (req, res, next) => {
  try {
    const { phone, type, data } = req.body;
    console.log(`📱 [WhatsApp] "${type}" queued for ${phone}:`, data);
    res.json({ success: true, message: `WhatsApp ${type} message queued for ${phone}`, timestamp: new Date().toISOString() });
  } catch (err) { next(err); }
};

// ── POST /api/whatsapp/inbound  (Twilio webhook — client replies) ─────────────
// Set in Twilio Console → WhatsApp Sandbox → "When a message comes in"
// URL: https://YOUR_SERVER/api/whatsapp/inbound
//
// Client sends PAID / YES / DONE → oldest pending tranche marked paid automatically.
const handleInbound = async (req, res, next) => {
  try {
    const body = (req.body.Body || '').trim().toUpperCase();
    const from = (req.body.From || '').replace('whatsapp:', '').replace(/\D/g, '');
    const msgSvc = new twiml.MessagingResponse();

    const PAID_KEYWORDS = ['PAID', 'YES', 'DONE', 'CONFIRM', 'PAYMENT DONE'];
    const isPaid = PAID_KEYWORDS.some(k => body.includes(k));

    if (!isPaid) {
      msgSvc.message(
        '👋 Thank you for your message!\n\nTo confirm an installment payment, reply *PAID*.\nFor other queries, please call us directly.'
      );
      res.type('text/xml').send(msgSvc.toString());
      return;
    }

    // Find the most recent active payment for this phone number
    const phone10 = from.slice(-10);
    const payment = await Payment.findOne({
      clientPhone: { $regex: phone10 },
      status: { $in: ['temporary', 'deposit', 'confirmed'] },
    }).sort({ createdAt: -1 });

    if (!payment) {
      msgSvc.message('❓ We could not find an active booking for your number. Please contact us directly.');
      res.type('text/xml').send(msgSvc.toString());
      return;
    }

    // Find the specific tranche based on what they replied (30%, 50%, or 20%)
    let tranche;
    
    if (body.includes('30')) {
      tranche = payment.installmentPlan.tranches.find(t => t.label.includes('30%') && t.status !== 'paid');
    } else if (body.includes('50')) {
      tranche = payment.installmentPlan.tranches.find(t => t.label.includes('50%') && t.status !== 'paid');
    } else if (body.includes('20')) {
      tranche = payment.installmentPlan.tranches.find(t => t.label.includes('20%') && t.status !== 'paid');
    }

    // Fallback: If they just said "PAID" without a number, pick the oldest pending tranche
    if (!tranche) {
      tranche = payment.installmentPlan.tranches.find(t => t.status === 'pending' || t.status === 'overdue');
    }

    if (!tranche) {
      msgSvc.message(`✅ All instalments are already marked as paid for booking *${payment.bookingRef}*. Thank you!`);
      res.type('text/xml').send(msgSvc.toString());
      return;
    }

    // Mark tranche paid
    tranche.status = 'paid';
    tranche.paidAt = new Date();
    tranche.mode   = 'UPI';

    // Recalculate overall status
    const totalPaid = payment.installmentPlan.tranches
      .filter(t => t.status === 'paid')
      .reduce((s, t) => s + t.amount, 0);

    if (totalPaid >= payment.totalValue) {
      payment.status    = 'settled';
      payment.settledAt = new Date();
      await Booking.findByIdAndUpdate(payment.booking, { status: 'completed' });
    } else if (totalPaid >= payment.totalValue * 0.30 && payment.status === 'temporary') {
      payment.status      = 'deposit';
      payment.confirmedAt = new Date();
      await Booking.findByIdAndUpdate(payment.booking, { status: 'confirmed' });
    }

    payment.auditLog.push({
      action: 'TRANCHE_PAID_VIA_WHATSAPP',
      actor: payment.clientName,
      details: `${tranche.label} (₹${tranche.amount}) self-confirmed via WhatsApp reply`,
    });

    await payment.save();

    // Real-time socket update for Finance Dashboard
    const io = req.app.get('io');
    if (io) io.emit('payment:updated', { paymentId: payment._id.toString(), status: payment.status });

    // Build reply to client
    const remaining = payment.installmentPlan.tranches.filter(t => t.status === 'pending' || t.status === 'overdue');
    let replyMsg = `✅ *Payment Confirmed!* – ${payment.bookingRef}\n\nHi ${payment.clientName}, your *${tranche.label}* payment of *₹${tranche.amount.toLocaleString('en-IN')}* has been recorded. Thank you!\n\n`;

    if (remaining.length > 0) {
      const next = remaining[0];
      const nextDue = new Date(next.dueDate).toLocaleDateString('en-IN', { dateStyle: 'medium' });
      replyMsg += `📋 *Next installment:*\n${next.label} – ₹${next.amount.toLocaleString('en-IN')}\nDue: ${nextDue}\n\nReply *PAID* once done.`;
    } else {
      replyMsg += `🎉 All instalments are now settled! We look forward to hosting your event!`;
    }

    msgSvc.message(replyMsg);
    res.type('text/xml').send(msgSvc.toString());
  } catch (err) {
    console.error('[Inbound WhatsApp] Error:', err.message);
    const msgSvc = new twiml.MessagingResponse();
    msgSvc.message('Sorry, we had a technical issue. Please call us directly.');
    res.type('text/xml').send(msgSvc.toString());
  }
};

module.exports = { sendNotification, handleInbound };
