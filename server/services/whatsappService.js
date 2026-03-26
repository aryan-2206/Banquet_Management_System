const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const FROM = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';

/**
 * Normalise phone → whatsapp:+91XXXXXXXXXX
 */
function toWhatsApp(phone) {
  const digits = String(phone).replace(/\D/g, '');
  // If already has country code (10+ digits starting with 91 or 1 etc.)
  if (digits.length === 10) return `whatsapp:+91${digits}`;
  return `whatsapp:+${digits}`;
}

/**
 * Format date to readable Indian format: 26 Mar 2026
 */
function fmtDate(date) {
  return new Date(date).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
  });
}

/**
 * Format currency: ₹1,20,000
 */
function fmtAmt(n) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Initial Installment Plan Message (sent on booking creation)
// ─────────────────────────────────────────────────────────────────────────────
async function sendInstallmentPlan(clientPhone, data) {
  const {
    enquiryId, clientName, eventType, eventDate,
    venue, pax, totalValue,
    tranche1, tranche2, tranche3,
  } = data;

  const body = `🎉 *Booking Enquiry Registered* – ${enquiryId}

Hi ${clientName}! Your event enquiry has been created successfully.

📅 *Event:* ${eventType} on ${fmtDate(eventDate)}
🏛 *Venue:* ${venue}
👥 *Guests:* ${pax}
💰 *Total:* ${fmtAmt(totalValue)}

━━━━━━━━━━━━━━━━━━━
💳 *Your Installment Plan:*
━━━━━━━━━━━━━━━━━━━

1️⃣ *30% Advance – ${fmtAmt(tranche1.amount)}*
   ⏰ Due by: ${fmtDate(tranche1.dueDate)} _(within 48 hours)_

2️⃣ *50% Pre-Event – ${fmtAmt(tranche2.amount)}*
   📆 Due by: ${fmtDate(tranche2.dueDate)} _(your chosen date)_

3️⃣ *20% On Event Day – ${fmtAmt(tranche3.amount)}*
   📅 Due on: ${fmtDate(tranche3.dueDate)}

━━━━━━━━━━━━━━━━━━━
⚠️ Please pay the *30% advance within 48 hours* to secure your booking. Unpaid slots are auto-released.

For queries, reply here or call us. Thank you! 🙏`;

  try {
    const msg = await client.messages.create({
      from: FROM,
      to: toWhatsApp(clientPhone),
      body,
    });
    console.log(`✅ [WhatsApp] Installment plan sent to ${clientPhone} | SID: ${msg.sid}`);
    return { success: true, sid: msg.sid };
  } catch (err) {
    console.error(`❌ [WhatsApp] Failed to send to ${clientPhone}:`, err.message);
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Reminder Message (sent by cron scheduler)
// ─────────────────────────────────────────────────────────────────────────────
async function sendReminder(clientPhone, data) {
  const { clientName, enquiryId, trancheLabel, amount, dueDate, daysLeft } = data;

  const urgency = daysLeft === 1 ? '🚨 *URGENT* – ' : '⏰ *Reminder* – ';

  const body = `${urgency}${enquiryId}

Hi ${clientName}, your *${trancheLabel}* payment of *${fmtAmt(amount)}* is due in *${daysLeft} day${daysLeft > 1 ? 's' : ''}* on ${fmtDate(dueDate)}.

Please arrange the payment at the earliest to avoid any inconvenience to your booking.

Thank you! 🎊`;

  try {
    const msg = await client.messages.create({
      from: FROM,
      to: toWhatsApp(clientPhone),
      body,
    });
    console.log(`✅ [WhatsApp] ${daysLeft}-day reminder sent to ${clientPhone} | SID: ${msg.sid}`);
    return { success: true, sid: msg.sid };
  } catch (err) {
    console.error(`❌ [WhatsApp] Reminder failed for ${clientPhone}:`, err.message);
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Payment Confirmation Message (sent when Finance team marks tranche paid)
// ─────────────────────────────────────────────────────────────────────────────
async function sendPaymentConfirmation(clientPhone, data) {
  const { clientName, enquiryId, trancheLabel, amount } = data;

  const body = `✅ *Payment Received* – ${enquiryId}

Hi ${clientName}, we have received your *${trancheLabel}* payment of *${fmtAmt(amount)}*. Thank you!

Your booking has been updated accordingly. We look forward to hosting your event! 🎉

For any queries, feel free to reply here.`;

  try {
    const msg = await client.messages.create({
      from: FROM,
      to: toWhatsApp(clientPhone),
      body,
    });
    console.log(`✅ [WhatsApp] Payment confirmation sent to ${clientPhone} | SID: ${msg.sid}`);
    return { success: true, sid: msg.sid };
  } catch (err) {
    console.error(`❌ [WhatsApp] Confirmation failed for ${clientPhone}:`, err.message);
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. QR Code Delivery (sent when a QR is generated for a guest)
// ─────────────────────────────────────────────────────────────────────────────
async function sendQRCode(guestPhone, data) {
  const { guestName, eventName, familyMembers = 1, qrImageUrl } = data;

  const membersLine = familyMembers > 1
    ? `👨‍👩‍👧 *Family Members:* ${familyMembers} (this QR admits all ${familyMembers})`
    : `👤 *Entry for:* 1 person`;

  const body = `🎟️ *Your Event Entry QR Code*

Hi ${guestName}! Your entry pass for *${eventName}* is ready.

${membersLine}

━━━━━━━━━━━━━━━━━━━
📲 *Instructions:*
• Keep this QR code screenshot saved
• Show it at the entry gate for scanning
• This QR is unique to you — do not share
━━━━━━━━━━━━━━━━━━━

See you at the event! 🎉`;

  try {
    const msgOptions = {
      from: FROM,
      to: toWhatsApp(guestPhone),
      body,
    };

    // Attach the QR image if a public URL is provided
    if (qrImageUrl) {
      msgOptions.mediaUrl = [qrImageUrl];
    }

    const msg = await client.messages.create(msgOptions);
    console.log(`✅ [WhatsApp] QR Code sent to ${guestPhone} | SID: ${msg.sid}`);
    return { success: true, sid: msg.sid };
  } catch (err) {
    console.error(`❌ [WhatsApp] QR delivery failed for ${guestPhone}:`, err.message);
    return { success: false, error: err.message };
  }
}

module.exports = { sendInstallmentPlan, sendReminder, sendPaymentConfirmation, sendQRCode };