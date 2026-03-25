const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');
const Payment = require('../models/Payment');

// @desc  Revenue report
// GET   /api/reports/revenue
router.get('/revenue', async (req, res, next) => {
  try {
    const bookingStats = await Booking.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 }, value: { $sum: '$costEstimate.totalCost' } } }
    ]);
    res.json({ success: true, stats: bookingStats });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
