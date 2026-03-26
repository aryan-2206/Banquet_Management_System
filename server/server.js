require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const ngrok = require('@ngrok/ngrok');

const app = require('./app');
const connectDB = require('./config/db');
const { PORT, CORS_ORIGIN } = require('./config/env');
const { startReminderScheduler } = require('./services/reminderScheduler');

// ── Database ────────────────────────────────────────────────
connectDB();

// ── HTTP + Socket.IO ────────────────────────────────────────
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: [CORS_ORIGIN, 'http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// ── Attach socket handlers ──────────────────────────────────
require('./sockets/djSocket')(io);
require('./sockets/kitchenSocket')(io);

// Make io accessible in routes/controllers
app.set('io', io);


// ── Auto-release cron (every 15 min) ───────────────────────
const cron = require('node-cron');
const Payment = require('./models/Payment');
const Booking = require('./models/Booking');

cron.schedule('*/15 * * * *', async () => {
  try {
    const now = new Date();

    const expired = await Payment.find({
      status: 'temporary',
      advanceDeadline: { $lt: now }
    });

    if (expired.length === 0) return;

    const ids = expired.map(p => p._id);
    await Payment.updateMany({ _id: { $in: ids } }, { status: 'cancelled' });

    const bookingIds = expired.map(p => p.booking);
    await Booking.updateMany({ _id: { $in: bookingIds } }, { status: 'cancelled' });

    console.log(`⏱ Auto-released ${expired.length} expired booking(s)`);
  } catch (err) {
    console.error('Cron auto-release error:', err.message);
  }
});

// ── WhatsApp Reminder Scheduler (daily 9am IST) ─────────────────
startReminderScheduler();

// ── Start server + ngrok tunnel ─────────────────────────────
async function bootstrap() {
  await new Promise((resolve) => httpServer.listen(PORT, resolve));
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api/health`);
  console.log(`   Socket.IO ready`);

  // Start ngrok tunnel so Twilio can reach our /uploads files
  if (process.env.NGROK_AUTHTOKEN) {
    try {
      const listener = await ngrok.connect({
        addr:     PORT,
        authtoken: process.env.NGROK_AUTHTOKEN,
      });
      const publicUrl = listener.url();
      // Make it available everywhere in the process (e.g. qrService)
      process.env.SERVER_BASE_URL = publicUrl;
      console.log(`   🌐 ngrok public URL: ${publicUrl}`);
      console.log(`   📷 QR media base:   ${publicUrl}/uploads/qr-temp/\n`);
    } catch (err) {
      console.warn(`   ⚠️  ngrok failed (${err.message}) — QR WhatsApp delivery may not work locally.\n`);
    }
  } else {
    console.warn(`   ⚠️  NGROK_AUTHTOKEN not set — skipping tunnel. QR images won't be reachable by Twilio.\n`);
  }
}

bootstrap();