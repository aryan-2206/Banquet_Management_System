const express = require('express');
const router = express.Router();
const { getGuestList, addGuestsBatch, updateGuest, deleteGuest, checkInGuest } = require('../controllers/guestController');

// @desc  Get guest list for an event (for GRE and Client Portal)
// GET   /api/guests?bookingId=...
router.get('/', getGuestList);

// @desc  Add multiple guests (Client Portal)
// POST  /api/guests/batch
router.post('/batch', addGuestsBatch);

// @desc  Update single guest (e.g. RSVP status)
// PUT   /api/guests/:id
router.put('/:id', updateGuest);

// @desc  Delete single guest
// DELETE /api/guests/:id
router.delete('/:id', deleteGuest);

// @desc  Check-in guest (GRE marks them as checked in)
// POST  /api/guests/check-in/:id
router.post('/check-in/:id', checkInGuest);

module.exports = router;
