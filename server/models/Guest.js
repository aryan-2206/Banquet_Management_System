const mongoose = require('mongoose');

const GuestSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  eventId: {
    type: String,
    default: 'ev_001'
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  familyMembers: {
    type: Number,
    default: 1,
    min: 1
  },
  phone: {
    type: String,
    trim: true
  },
  dietary: [{
    type: String,
    enum: ['veg', 'jain', 'vegan', 'gluten', 'nut', 'nonVeg', 'halal']
  }],
  rsvp: {
    type: String,
    enum: ['confirmed', 'pending', 'declined'],
    default: 'pending'
  },
  walkIn: {
    type: Boolean,
    default: false
  },
  late: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['expected', 'checked-in', 'no-show'],
    default: 'expected'
  },
  checkInTime: Date
}, { timestamps: true });

module.exports = mongoose.model('Guest', GuestSchema);
