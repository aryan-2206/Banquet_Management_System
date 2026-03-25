require('dotenv').config();
const path=require('path');
const express = require('express');
const cors = require('cors');
const { CORS_ORIGIN } = require('./config/env');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes      = require('./routes/auth');
const bookingRoutes   = require('./routes/bookings');
const paymentRoutes   = require('./routes/payments');
const guestRoutes     = require('./routes/guests');
const menuRoutes      = require('./routes/menu');
const kitchenRoutes   = require('./routes/kitchen');
const whatsappRoutes  = require('./routes/whatsapp');
const aiRoutes        = require('./routes/ai');
const reportRoutes    = require('./routes/reports');
const eventGalleryRoutes=require('./routes/eventGallery');

const app = express();

// ── Middleware ──────────────────────────────────────────────
app.use(cors({
  origin: [CORS_ORIGIN, 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
//upload files statiscally
app.use('/uploads',express.static(path.join(__dirname,'uploads')));

// ── Health check ────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Banquet IntelliManager API is running 🚀', timestamp: new Date().toISOString() });
});

// ── API Routes ──────────────────────────────────────────────
app.use('/api/auth',      authRoutes);
app.use('/api/bookings',  bookingRoutes);
app.use('/api/payments',  paymentRoutes);
app.use('/api/guests',    guestRoutes);
app.use('/api/menu',      menuRoutes);
app.use('/api/kitchen',   kitchenRoutes);
app.use('/api/whatsapp',  whatsappRoutes);
app.use('/api/ai',        aiRoutes);
app.use('/api/reports',   reportRoutes);
app.use('/api/events',eventGalleryRoutes);

// ── 404 handler ─────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found` });
});

// ── Global error handler ────────────────────────────────────
app.use(errorHandler);

module.exports = app;
