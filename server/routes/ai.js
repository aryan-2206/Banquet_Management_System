const express = require('express');
const router  = express.Router();

const { getInsights, getMenuSuggestions, getPostMortem } = require('../controllers/aiController');

// @desc  Get AI-driven insights for the banquet management
// GET   /api/ai/insights
router.get('/insights', getInsights);

// @desc  Get AI menu suggestions based on event type + past orders
// GET   /api/ai/menu-suggestions?eventType=wedding&pax=200&tier=Premium
router.get('/menu-suggestions', getMenuSuggestions);

// @desc  Generate AI post-event audit summary
// GET   /api/ai/post-mortem/:bookingId
router.get('/post-mortem/:bookingId', getPostMortem);

module.exports = router;
