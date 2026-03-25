const mongoose = require('mongoose');

const EventPhotoSchema = new mongoose.Schema({
  eventId: {
    type: String,   // Matches the event's enquiryId / id string (e.g. 'E001')
    required: true,
    index: true
  },
  bookingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking'
  },
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String
  },
  mimeType: {
    type: String,
    required: true
  },
  size: {
    type: Number   // bytes
  },
  caption: {
    type: String,
    trim: true,
    default: ''
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

// Quick lookup index
EventPhotoSchema.index({ eventId: 1, uploadedAt: -1 });

module.exports = mongoose.model('EventPhoto', EventPhotoSchema);
