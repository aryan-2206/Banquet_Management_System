const crypto = require('crypto');
const path   = require('path');
const fs     = require('fs');
const QRCode = require('qrcode');
const QRCodeModel = require('../models/QRCode');
const { sendQRCode: sendQRCodeViaWhatsApp } = require('./whatsappService');

// Directory to temporarily store QR PNGs so Twilio can fetch them
// In production, upload to S3/Cloudinary and return a permanent URL instead.
const QR_TEMP_DIR = path.join(__dirname, '..', 'uploads', 'qr-temp');
if (!fs.existsSync(QR_TEMP_DIR)) fs.mkdirSync(QR_TEMP_DIR, { recursive: true });

class QRService {
  /**
   * Generates a QR code for a guest, stores it in the DB,
   * saves the PNG to disk, and optionally sends it via WhatsApp.
   *
   * @param {Object} options
   * @param {String}  options.entityType      'Guest' | 'Booking' | 'Other'
   * @param {String}  options.entityId        MongoDB ObjectId of the entity
   * @param {Object}  options.data            Additional data (name, phone, event, etc.)
   * @param {Number}  options.familyMembers   Number of family members allowed (default 1)
   * @param {String}  options.phone           Guest phone for WhatsApp delivery (optional)
   * @param {String}  options.serverBaseUrl   Public base URL of the server for media (e.g. https://yourdomain.com)
   * @returns {Object} { qrId, qrCodeImage, whatsappResult? }
   */
  async generateQRCode({
    entityType    = 'Other',
    entityId      = null,
    data          = {},
    familyMembers = 1,
    phone         = null,
    serverBaseUrl = process.env.SERVER_BASE_URL || 'http://localhost:5001'
  } = {}) {
    try {
      const qrId = crypto.randomUUID();

      // Normalise familyMembers to a positive integer
      const members = Math.max(1, Math.floor(Number(familyMembers) || 1));

      // Save to DB
      const qrRecord = new QRCodeModel({
        qrId,
        entityType,
        entityId,
        data,
        familyMembers: members,
        status: 'active'
      });
      await qrRecord.save();

      // QR image content: embed the qrId so scanning apps can pass it to /verify
      const qrContent = JSON.stringify({ qrId, familyMembers: members });

      // Generate base64 DataURI (used by the frontend renderer)
      const qrCodeImage = await QRCode.toDataURL(qrContent, {
        errorCorrectionLevel: 'M',
        margin: 3,
        width: 400,
        color: { dark: '#1A1A2E', light: '#FFFFFF' }
      });

      // Also save a PNG file to disk so Twilio can fetch it via public URL
      const filename  = `${qrId}.png`;
      const filePath  = path.join(QR_TEMP_DIR, filename);
      await QRCode.toFile(filePath, qrContent, {
        errorCorrectionLevel: 'M',
        margin: 3,
        width: 400,
        color: { dark: '#1A1A2E', light: '#FFFFFF' }
      });

      const qrPublicUrl = `${serverBaseUrl}/uploads/qr-temp/${filename}`;

      // Send via WhatsApp if phone is provided
      let whatsappResult = null;
      if (phone) {
        const guestName = data.name || 'Guest';
        const eventName = data.eventName || 'the event';

        whatsappResult = await sendQRCodeViaWhatsApp(phone, {
          guestName,
          eventName,
          familyMembers: members,
          qrImageUrl: qrPublicUrl
        });
      }

      return {
        success: true,
        qrId,
        qrCodeImage,    // base64 DataURI
        qrPublicUrl,    // disk-backed public URL
        familyMembers: members,
        whatsappResult
      };
    } catch (error) {
      console.error('Error in QRService.generateQRCode:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Verifies a QR Code. On success marks it 'scanned' and returns the
   * family member count so the gate staff knows how many people to admit.
   */
  async verifyQRCode(qrId) {
    try {
      const qrRecord = await QRCodeModel.findOne({ qrId });

      if (!qrRecord) {
        return { valid: false, message: 'QR Code not found or invalid' };
      }

      if (qrRecord.status === 'scanned' || qrRecord.familyMembers <= 0) {
        return {
          valid: false,
          message: 'QR Code fully redeemed (No entries remaining)',
          scannedAt: qrRecord.scannedAt,
          familyMembers: 0
        };
      }

      if (qrRecord.status !== 'active') {
        return { valid: false, message: `QR Code is ${qrRecord.status}` };
      }

      // Decrement allowed members
      qrRecord.familyMembers -= 1;

      // Mark as scanned if no more members allowed
      if (qrRecord.familyMembers <= 0) {
        qrRecord.status = 'scanned';
      }
      
      qrRecord.scannedAt = new Date();
      await qrRecord.save();

      return {
        valid: true,
        message: `1 Guest Admitted. Remaining entries: ${qrRecord.familyMembers}`,
        familyMembers: qrRecord.familyMembers,
        data:          qrRecord.data,
        entityType:    qrRecord.entityType,
        entityId:      qrRecord.entityId
      };
    } catch (error) {
      console.error('Error in QRService.verifyQRCode:', error);
      throw new Error('Failed to verify QR code');
    }
  }

  /** Manually revoke a QR Code (e.g. booking cancelled) */
  async revokeQRCode(qrId) {
    try {
      const result = await QRCodeModel.findOneAndUpdate(
        { qrId },
        { status: 'revoked' },
        { new: true }
      );
      return !!result;
    } catch (error) {
      console.error('Error in QRService.revokeQRCode:', error);
      throw new Error('Failed to revoke QR code');
    }
  }
}

module.exports = new QRService();
