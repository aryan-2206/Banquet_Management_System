const express = require('express');
const router = express.Router();

const { getKitchenEvents, getLiveHeadcount } = require('../controllers/kitchenController');

// @desc  Get kitchen events (active bookings for today/upcoming)
// GET   /api/kitchen/events
router.get('/events', getKitchenEvents);

// @desc  Get live headcount for a specific event
// GET   /api/kitchen/live-pax/:id
router.get('/live-pax/:id', getLiveHeadcount);

module.exports = router;