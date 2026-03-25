const cron = require('node-cron');
const Payment = require('../models/Payment');
const { sendReminder } = require('./whatsappService');

/**
 * Returns the difference in whole days between dueDate and today (IST midnight).
 * Positive = due in the future, 0 = due today, negative = overdue.
 */
function daysUntil(dueDate) {
  const now = new Date();
  // Strip time — compare at midnight
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const due   = new Date(new Date(dueDate).getFullYear(), new Date(dueDate).getMonth(), new Date(dueDate).getDate());
  return Math.round((due - today) / (1000 * 60 * 60 * 24));
}

/**
 * Check all active payments and fire WhatsApp reminders:
 *   – 2 days before each pending tranche due date
 *   – 1 day before each pending tranche due date
 * Uses tranche.remindersSent[] to avoid duplicate sends.
 */
async function runReminderCheck() {
  try {
    const payments = await Payment.find({
      status: { $in: ['temporary', 'deposit', 'confirmed'] },
    });

    let reminded = 0;

    for (const payment of payments) {
      let modified = false;

      for (const tranche of payment.installmentPlan.tranches) {
        if (tranche.status === 'paid') continue;   // already paid, skip

        const days = daysUntil(tranche.dueDate);
        const reminderKeys = [];
        if (days === 2) reminderKeys.push('2day');
        if (days === 1) reminderKeys.push('1day');

        for (const key of reminderKeys) {
          if (tranche.remindersSent.includes(key)) continue;   // already sent

          const sent = await sendReminder(payment.clientPhone, {
            clientName:   payment.clientName,
            enquiryId:    payment.bookingRef || payment._id.toString(),
            trancheLabel: tranche.label,
            amount:       tranche.amount,
            dueDate:      tranche.dueDate,
            daysLeft:     days,
          });

          if (sent.success) {
            tranche.remindersSent.push(key);
            modified = true;
            reminded++;
            console.log(`[Scheduler] Reminder sent: ${key} for ${tranche.label} → ${payment.clientPhone}`);
          }
        }

        // Mark overdue
        if (days < 0 && tranche.status === 'pending') {
          tranche.status = 'overdue';
          modified = true;
        }
      }

      if (modified) await payment.save();
    }

    console.log(`[Scheduler] Reminder run complete. ${reminded} reminders sent, ${payments.length} payments checked.`);
  } catch (err) {
    console.error('[Scheduler] Error during reminder check:', err.message);
  }
}

/**
 * Start the cron scheduler.
 * Runs every day at 09:00 AM IST (03:30 UTC).
 * Also runs immediately once on startup for easy testing.
 */
function startReminderScheduler() {
  // Daily at 9:00 AM IST (UTC+5:30 → UTC 03:30)
  cron.schedule('30 3 * * *', () => {
    console.log('[Scheduler] Running daily reminder check…');
    runReminderCheck();
  }, { timezone: 'Asia/Kolkata' });

  console.log('✅ [Scheduler] Reminder scheduler started (daily 09:00 IST)');
}

module.exports = { startReminderScheduler, runReminderCheck };