const express = require('express');
const router = express.Router();

const { sendNotification } = require('../controllers/whatsappController');

// @desc  Send WhatsApp notification
// POST  /api/whatsapp/send
router.post('/send', sendNotification);

module.exports = router;
