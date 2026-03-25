const express = require('express');
const router = express.Router();

const { getInsights } = require('../controllers/aiController');

// @desc  Get AI-driven insights for the banquet management
// GET   /api/ai/insights
router.get('/insights', getInsights);

module.exports = router;
