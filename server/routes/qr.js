const express = require('express');
const router  = express.Router();
const qrService = require('../services/qrService');

/**
 * POST /api/qr/generate
 * Body: { name, phone, familyMembers, eventName, eventId }
 * Generates a QR code, saves to DB, sends via WhatsApp if phone is provided.
 */
router.post('/generate', async (req, res) => {
  try {
    const {
      name          = 'Guest',
      phone         = null,
      familyMembers = 1,
      eventName     = 'the event',
      eventId       = null,
    } = req.body;

    const result = await qrService.generateQRCode({
      entityType:    'Guest',
      entityId:      eventId,
      familyMembers: Number(familyMembers) || 1,
      data:          { name, eventName },
      phone,
      serverBaseUrl: process.env.SERVER_BASE_URL || `http://localhost:${process.env.PORT || 5001}`
    });

    res.status(201).json({
      success:       true,
      qrId:          result.qrId,
      qrCodeImage:   result.qrCodeImage,
      familyMembers: result.familyMembers,
      whatsapp:      result.whatsappResult
    });
  } catch (err) {
    console.error('[QR Route] error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/qr/verify
 * Body: { qrId }
 */
router.post('/verify', async (req, res) => {
  try {
    const { qrId } = req.body;
    if (!qrId) return res.status(400).json({ success: false, error: 'qrId is required' });

    const result = await qrService.verifyQRCode(qrId);
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('[QR Route] verify error:', err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
