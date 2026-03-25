// @desc  Send WhatsApp notification (stub - logs to console since no WhatsApp Business API key configured)
// POST  /api/whatsapp/send
const sendNotification = async (req, res, next) => {
  try {
    const { phone, type, data } = req.body;
    
    console.log(`📱 [WhatsApp] Sending "${type}" notification to ${phone}:`, data);
    
    // In a real production environment, you'd integrate with Twilio or Meta WhatsApp Business API here.
    // E.g., client.messages.create({ body: '...', from: '...', to: '...' });

    res.json({
      success: true,
      message: `WhatsApp ${type} message queued for ${phone}`,
      mockSent: true,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { sendNotification };
