const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
  // Personal Details
  personalDetails: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    company: {
      type: String,
      trim: true
    },
    gstNumber: {
      type: String,
      trim: true
    }
  },

  // Event Details
  eventDetails: {
    eventType: {
      type: String,
      required: true,
      // Normalized by bookingController: wedding, corporate, birthday, anniversary, conference, reception, other
    },
    guests: {
      type: Number,
      required: true,
      min: 1
    },
    date: {
      type: Date,
      required: true
    },
    time: {
      type: String,
      required: true
    },
    venue: {
      type: String,
      required: true,
      // Normalized by bookingController: grand-ballroom, terrace-garden, crystal-hall, banquet-suite-a, rooftop-lounge, garden-pavilion
    }
  },

  // Menu Selection
  menuSelection: {
    selectedItems: [{
      id: String,
      name: String,
      price: Number,
      category: String,
      quantity: {
        type: Number,
        default: 1
      }
    }],
    customRequirements: {
      type: String,
      trim: true
    },
    catering: {
      type: String,
      enum: ['veg', 'non-veg', 'both'],
      default: 'both'
    }
  },

  // Additional Requirements
  additionalRequirements: {
    budget: {
      type: Number,
      min: 0
    },
    specialRequests: {
      type: String,
      trim: true
    },
    decoration: {
      type: String,
      enum: ['basic', 'premium', 'luxury', 'custom'],
      default: 'basic'
    },
    entertainment: {
      type: String,
      enum: ['dj', 'live-band', 'none', 'custom'],
      default: 'none'
    },
    photography: {
      type: Boolean,
      default: false
    }
  },

  // Cost Calculation
  costEstimate: {
    venueCost: {
      type: Number,
      default: 0
    },
    menuCost: {
      type: Number,
      default: 0
    },
    additionalCost: {
      type: Number,
      default: 0
    },
    totalCost: {
      type: Number,
      default: 0
    }
  },

  // Booking Status
  status: {
    type: String,
    enum: ['enquiry', 'confirmed', 'pending-payment', 'cancelled', 'completed'],
    default: 'enquiry'
  },

  // Sales Assignment
  salesManager: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Notes and Communication
  notes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BookingNote'
  }],

  // Timeline
  timeline: [{
    action: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    details: String
  }],

  // Metadata
  enquiryId: {
    type: String,
    unique: true
  },
  source: {
    type: String,
    enum: ['website', 'phone', 'email', 'referral'],
    default: 'website'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  tags: [String],

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastFollowUp: {
    type: Date
  },
  nextFollowUp: {
    type: Date
  }
});

// Generate unique enquiry ID before saving and handle other updates
BookingSchema.pre('save', async function() {
  // Generate enquiry ID for new bookings
  if (this.isNew && !this.enquiryId) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.enquiryId = `ENQ${year}${month}${random}`;
  }
  
  // Always update the timestamp
  this.updatedAt = new Date();
  
  // Add timeline entry when status changes
  if (this.isModified('status')) {
    this.timeline.push({
      action: `Status changed to ${this.status}`,
      timestamp: new Date(),
      details: `Booking status updated from ${this._modifiedPaths?.status || 'new'} to ${this.status}`
    });
  }
});

// Index for better search performance
BookingSchema.index({ enquiryId: 1 });
BookingSchema.index({ status: 1 });
BookingSchema.index({ 'eventDetails.date': 1 });
BookingSchema.index({ 'eventDetails.venue': 1 });
BookingSchema.index({ createdAt: -1 });
BookingSchema.index({ 'personalDetails.email': 1 });

// Virtual for formatted enquiry ID
BookingSchema.virtual('formattedEnquiryId').get(function() {
  return this.enquiryId;
});

// Method to calculate total cost
BookingSchema.methods.calculateTotalCost = function() {
  const venueRates = {
    'grand-ballroom': 150000,
    'terrace-garden': 80000,
    'crystal-hall': 100000,
    'banquet-suite-a': 60000,
    'rooftop-lounge': 50000
  };

  const decorationRates = {
    'basic': 25000,
    'premium': 50000,
    'luxury': 100000,
    'custom': 75000
  };

  const entertainmentRates = {
    'dj': 30000,
    'live-band': 50000,
    'none': 0,
    'custom': 40000
  };

  // Calculate venue cost
  this.costEstimate.venueCost = venueRates[this.eventDetails.venue] || 0;

  // Calculate menu cost
  this.costEstimate.menuCost = this.menuSelection.selectedItems.reduce((total, item) => {
    return total + (item.price * item.quantity);
  }, 0);

  // Calculate additional costs
  let additionalCost = 0;
  additionalCost += decorationRates[this.additionalRequirements.decoration] || 0;
  additionalCost += entertainmentRates[this.additionalRequirements.entertainment] || 0;
  if (this.additionalRequirements.photography) {
    additionalCost += 35000;
  }

  this.costEstimate.additionalCost = additionalCost;
  this.costEstimate.totalCost = this.costEstimate.venueCost + this.costEstimate.menuCost + this.costEstimate.additionalCost;

  return this.costEstimate.totalCost;
};

// Static method to get booking statistics
BookingSchema.statics.getBookingStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalValue: { $sum: '$costEstimate.totalCost' }
      }
    }
  ]);

  return stats.reduce((acc, stat) => {
    acc[stat._id] = {
      count: stat.count,
      totalValue: stat.totalValue
    };
    return acc;
  }, {});
};

module.exports = mongoose.model('Booking', BookingSchema);