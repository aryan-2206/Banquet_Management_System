const express = require('express');
const {
  createBooking, getBookings, getBooking, updateStatus, checkAvailability
} = require('../controllers/bookingController');

const router = express.Router();

// Public - availability check (used by booking form)
router.get('/check-availability', checkAvailability);

// Booking CRUD
router.post('/', createBooking);
router.get('/', getBookings);
router.get('/:id', getBooking);
router.patch('/:id/status', updateStatus);

module.exports = router;