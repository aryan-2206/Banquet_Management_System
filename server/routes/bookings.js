const express = require('express');
const router = express.Router();
const {
  createBooking,
  getBookings,
  getBooking,
  updateBooking,
  updateBookingStatus,
  assignSalesManager,
  getBookingStats,
  deleteBooking,
  getVenueAvailability
} = require('../controllers/bookingController');

// Public routes
router.post('/', createBooking);
router.get('/availability', getVenueAvailability);

// Protected routes (require authentication)
router.get('/', getBookings);
router.get('/stats', getBookingStats);
router.get('/:id', getBooking);
router.put('/:id', updateBooking);
router.patch('/:id/status', updateBookingStatus);
router.patch('/:id/assign', assignSalesManager);
router.delete('/:id', deleteBooking);

module.exports = router;