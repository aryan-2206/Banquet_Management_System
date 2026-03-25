const express = require('express');
const router = express.Router();
const { getGuestList, checkInGuest } = require('../controllers/guestController');

// @desc  Get guest list for an event (for GRE)
// GET   /api/guests
router.get('/', getGuestList);

// @desc  Check-in guest
// POST  /api/guests/check-in/:id
router.post('/check-in/:id', checkInGuest);

module.exports = router;
