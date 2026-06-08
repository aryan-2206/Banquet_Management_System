const twilio = require('twilio');

// Lazy client — only created when a message is actually being sent.
// This prevents server crash at startup if TWILIO_ACCOUNT_SID is not yet configured.
let _client = null;
function getClient() {
  if (_client) return _client;
  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  if (!sid || !sid.startsWith('AC')) {
    throw new Error('[WhatsApp] TWILIO_ACCOUNT_SID is not set or invalid. Set it in server/.env');
  }
  _client = twilio(sid, token);
  return _client;
}

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
    const msg = await getClient().messages.create({
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
    const msg = await getClient().messages.create({
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
    const msg = await getClient().messages.create({
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

    const msg = await getClient().messages.create(msgOptions);
    console.log(`✅ [WhatsApp] QR Code sent to ${guestPhone} | SID: ${msg.sid}`);
    return { success: true, sid: msg.sid };
  } catch (err) {
    console.error(`❌ [WhatsApp] QR delivery failed for ${guestPhone}:`, err.message);
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. Enquiry Confirmation (sent when landing page enquiry form submitted)
// ─────────────────────────────────────────────────────────────────────────────
async function sendEnquiryConfirmation(clientPhone, data) {
  const { clientName, eventType, eventDate, venue, pax, enquiryId } = data;

  const body = `🎊 *Enquiry Received!* – ${enquiryId || 'BIM'}

Hi ${clientName}! Thank you for reaching out to *Banquet IntelliManager*.

We've received your event enquiry and our Sales Manager will contact you within 24 hours.

📋 *Your Enquiry Summary:*
📅 Event: ${eventType || 'Event'}
📆 Date: ${eventDate ? fmtDate(eventDate) : 'TBD'}
🏛 Venue: ${venue || 'To be selected'}
👥 Guests: ${pax || 'TBD'}

━━━━━━━━━━━━━━━━━━━
We'll send you a detailed proposal with our packages and pricing shortly.

For urgent queries, reply here and our team will assist you. 🙏`;

  try {
    const msg = await getClient().messages.create({
      from: FROM,
      to: toWhatsApp(clientPhone),
      body,
    });
    console.log(`✅ [WhatsApp] Enquiry confirmation sent to ${clientPhone} | SID: ${msg.sid}`);
    return { success: true, sid: msg.sid };
  } catch (err) {
    console.error(`❌ [WhatsApp] Enquiry confirmation failed for ${clientPhone}:`, err.message);
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. Guest QR + DJ Room Code (sent to each invited guest after full payment)
// ─────────────────────────────────────────────────────────────────────────────
async function sendGuestQRWithDJCode(guestPhone, data) {
  const { guestName = 'Guest', eventName, eventDate, venue, djRoomCode, qrImageUrl } = data;

  const body = `🎟️ *Your Entry Pass – ${eventName}*

Hi ${guestName}! You've been invited to *${eventName}* on ${fmtDate(eventDate)} at *${venue}*.

━━━━━━━━━━━━━━━━━━━
📲 *Entry QR Code:*
Show the image above at the entry gate. Each QR is unique — do not share it.
━━━━━━━━━━━━━━━━━━━

🎵 *Join the DJ Room:*
Want to request songs on the event day? Join the live music queue:

🔑 *Room Code:* \`${djRoomCode}\`

Open the event app → DJ tab → Enter code *${djRoomCode}* to join.

See you there! 🎉`;

  try {
    const msgOptions = {
      from: FROM,
      to:   toWhatsApp(guestPhone),
      body,
    };
    if (qrImageUrl) msgOptions.mediaUrl = [qrImageUrl];

    const msg = await getClient().messages.create(msgOptions);
    console.log(`✅ [WhatsApp] Guest QR + DJ code sent to ${guestPhone} | SID: ${msg.sid}`);
    return { success: true, sid: msg.sid };
  } catch (err) {
    console.error(`❌ [WhatsApp] Guest QR send failed for ${guestPhone}:`, err.message);
    return { success: false, error: err.message };
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. Ask Client for Guest List (sent after full payment received)
// ─────────────────────────────────────────────────────────────────────────────
async function askForGuestList(clientPhone, data) {
  const { clientName, enquiryId, eventName } = data;

  const body = `🎉 *Full Payment Confirmed!* – ${enquiryId}

Hi ${clientName}! Your booking for *${eventName}* is now fully settled. We look forward to hosting you! 🙏

━━━━━━━━━━━━━━━━━━━
📋 *Guest Entry QR Codes*
━━━━━━━━━━━━━━━━━━━

To send entry QR codes to your guests, please reply with their mobile numbers (Indian format, one per line or comma-separated):

_Example:_
9876543210
8765432109, 7654321098

We'll send a personalized QR entry pass and DJ room code to each number. 🎊`;

  try {
    const msg = await getClient().messages.create({ from: FROM, to: toWhatsApp(clientPhone), body });
    console.log(`✅ [WhatsApp] Guest list request sent to ${clientPhone} | SID: ${msg.sid}`);
    return { success: true, sid: msg.sid };
  } catch (err) {
    console.error(`❌ [WhatsApp] Guest list request failed for ${clientPhone}:`, err.message);
    return { success: false, error: err.message };
  }
}

module.exports = {
  sendInstallmentPlan,
  sendReminder,
  sendPaymentConfirmation,
  sendQRCode,
  sendEnquiryConfirmation,
  sendGuestQRWithDJCode,
  askForGuestList,
};
