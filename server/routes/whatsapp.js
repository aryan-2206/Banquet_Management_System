const express = require('express');
const router = express.Router();

const { sendNotification, handleInbound } = require('../controllers/whatsappController');

// @desc  Send WhatsApp notification
// POST  /api/whatsapp/send
router.post('/send', sendNotification);

// @desc  Twilio Webhook for Inbound Messages
// POST  /api/whatsapp/inbound
router.post('/inbound', handleInbound);

module.exports = router;