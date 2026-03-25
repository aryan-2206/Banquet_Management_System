const mongoose = require('mongoose');

const InstallmentSchema = new mongoose.Schema({
  label: { type: String, required: true },
  pct: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  amount: { type: Number, required: true },
  paidAt: { type: Date },
  utr: { type: String, trim: true },
  mode: {
    type: String,
    enum: ['NEFT', 'RTGS', 'UPI', 'Cash', 'Cheque', 'Card'],
    default: 'UPI',
  },
  status: {
    type: String,
    enum: ['pending', 'paid', 'overdue'],
    default: 'pending',
  },
  // Tracks which reminders have already been sent (e.g. ['2day', '1day'])
  remindersSent: [{ type: String }],
});

const PaymentSchema = new mongoose.Schema({
  booking: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking', required: true },
  bookingRef: { type: String }, // e.g. BK-2601
  clientName: { type: String, required: true },
  clientPhone: { type: String },
  eventDate: { type: Date, required: true },
  hall: { type: String },
  
  totalValue: { type: Number, required: true, min: 0 },
  gstRate: { type: Number, default: 18 },
  isInterstate: { type: Boolean, default: false },
  invoiceNo: { type: String },

  // Client-chosen date for the 50% pre-event instalment
  preEventInstallmentDate: { type: Date },

  installmentPlan: {
    template: { type: String, default: 'standard' },
    tranches: [InstallmentSchema],
  },

  payments: [{
    trancheId: { type: String },
    type: { type: String }, // 'Initial Deposit', 'Mid-term', etc.
    amount: { type: Number, required: true },
    utr: { type: String, trim: true },
    mode: { type: String, enum: ['NEFT', 'RTGS', 'UPI', 'Cash', 'Cheque', 'Card'] },
    date: { type: Date, default: Date.now },
    recordedBy: { type: String },
    notes: { type: String },
  }],

  status: {
    type: String,
    enum: ['temporary', 'deposit', 'confirmed', 'overdue', 'settled', 'cancelled'],
    default: 'temporary',
  },

  advanceDeadline: { type: Date }, // 2 days from enquiry creation
  confirmedAt: { type: Date },
  settledAt: { type: Date },
  
  auditLog: [{
    action: String,
    actor: String,
    timestamp: { type: Date, default: Date.now },
    details: String,
  }],
}, { timestamps: true });

// Virtuals
PaymentSchema.virtual('totalPaid').get(function () {
  return this.payments.reduce((sum, p) => sum + p.amount, 0);
});
PaymentSchema.virtual('outstanding').get(function () {
  return Math.max(0, this.totalValue - this.totalPaid);
});

PaymentSchema.set('toJSON', { virtuals: true });
PaymentSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Payment', PaymentSchema);