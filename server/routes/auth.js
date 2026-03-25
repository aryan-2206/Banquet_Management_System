const express = require('express');
const router = express.Router();

// Placeholder auth routes
router.post('/login', (req, res) => {
  res.json({ success: false, message: 'Auth not implemented yet' });
});

router.post('/register', (req, res) => {
  res.json({ success: false, message: 'Auth not implemented yet' });
});

module.exports = router;