const mongoose = require('mongoose');

const QRCodeSchema = new mongoose.Schema({
  qrId: {
    type: String,
    required: true,
    unique: true
  },
  entityType: {
    type: String,
    enum: ['Guest', 'Booking', 'Other'],
    default: 'Other'
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'entityType'
  },
  data: {
    type: mongoose.Schema.Types.Mixed
  },
  familyMembers: {
    type: Number,
    default: 1,
    min: 0
  },
  status: {
    type: String,
    enum: ['active', 'scanned', 'expired', 'revoked'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 30 * 24 * 60 * 60 // Optional: Auto-expire after 30 days
  },
  scannedAt: {
    type: Date
  }
});

// Index to quickly verify by qrId
QRCodeSchema.index({ qrId: 1 });

module.exports = mongoose.model('QRCode', QRCodeSchema);
