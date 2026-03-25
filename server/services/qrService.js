const crypto = require('crypto');
const QRCode = require('qrcode');
const QRCodeModel = require('../models/QRCode'); // The Mongoose model we just created

class QRService {
  /**
   * Generates a QR code, stores the unique reference in the database,
   * and returns the base64 encoded image for rendering.
   * 
   * @param {Object} options Options for generation
   * @param {String} options.entityType 'Guest' | 'Booking' | 'Other'
   * @param {String} options.entityId The MongoDB ObjectId of the entity
   * @param {Object} options.data Any additional data to store with the QR code
   * @returns {Object} { qrId, qrCodeImage }
   */
  async generateQRCode({ entityType = 'Other', entityId = null, data = {} } = {}) {
    try {
      // 1. Generate a secure, unique identifier for the QR code
      const qrId = crypto.randomUUID();

      // 2. Save the metadata to the database so it can be verified later
      const qrRecord = new QRCodeModel({
        qrId,
        entityType,
        entityId,
        data,
        status: 'active'
      });
      await qrRecord.save();

      // 3. The content embedded in the QR image itself.
      // Often this is a full URL to a verification endpoint (e.g., https://yourdomain.com/verify?id={qrId})
      // For general app usage, embedding just the ID or JSON string works.
      const qrContent = JSON.stringify({ qrId });

      // 4. Generate the QR Code visual representation (Base64 Data URI)
      const qrCodeImage = await QRCode.toDataURL(qrContent, {
        errorCorrectionLevel: 'M',
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      return {
        success: true,
        qrId,
        qrCodeImage
      };
    } catch (error) {
      console.error('Error in QRService.generateQRCode:', error);
      throw new Error('Failed to generate QR code');
    }
  }

  /**
   * Verifies a QR Code by its ID and marks it as scanned if it was active.
   * 
   * @param {String} qrId The unique ID extracted from the scanned QR code
   * @returns {Object} { valid, message, qrData }
   */
  async verifyQRCode(qrId) {
    try {
      const qrRecord = await QRCodeModel.findOne({ qrId });

      if (!qrRecord) {
        return { valid: false, message: 'QR Code not found or invalid' };
      }

      if (qrRecord.status === 'scanned') {
        return { 
          valid: false, 
          message: 'QR Code has already been scanned',
          scannedAt: qrRecord.scannedAt
        };
      }

      if (qrRecord.status !== 'active') {
        return { 
          valid: false, 
          message: `QR Code is ${qrRecord.status}`
        };
      }

      // Mark as scanned
      qrRecord.status = 'scanned';
      qrRecord.scannedAt = new Date();
      await qrRecord.save();

      // Successful verification
      return {
        valid: true,
        message: 'QR Code verified successfully',
        data: qrRecord.data,
        entityType: qrRecord.entityType,
        entityId: qrRecord.entityId
      };
    } catch (error) {
      console.error('Error in QRService.verifyQRCode:', error);
      throw new Error('Failed to verify QR code');
    }
  }

  /**
   * Optionally manually revoke a QR Code (e.g. if an event is cancelled)
   */
  async revokeQRCode(qrId) {
    try {
      const result = await QRCodeModel.findOneAndUpdate(
        { qrId },
        { status: 'revoked' },
        { new: true }
      );
      return result ? true : false;
    } catch (error) {
      console.error('Error in QRService.revokeQRCode:', error);
      throw new Error('Failed to revoke QR code');
    }
  }
}

module.exports = new QRService();
