require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');

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

// ── Start server ────────────────────────────────────────────
httpServer.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`   API: http://localhost:${PORT}/api/health`);
  console.log(`   Socket.IO ready\n`);
});