const mongoose = require("mongoose");

const wasteEntrySchema = new mongoose.Schema(
  {
    dishId:   { type: mongoose.Schema.Types.ObjectId, ref: "Dish" },
    dishName: { type: String, required: true },
    course:   { type: String, required: true },
    prepared: { type: Number, required: true, min: 0 },
    leftover: { type: Number, required: true, min: 0 },
    reason: {
      type: String,
      enum: ["over-prepared", "not-ordered", "quality-issue", "equipment-failure", "event-cancelled", "other"],
      default: "over-prepared",
    },
  },
  { _id: false }
);

const wasteLogSchema = new mongoose.Schema(
  {
    eventId:           { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    date:              { type: Date, default: Date.now },
    entries:           [wasteEntrySchema],
    sustainabilityScore: { type: Number, min: 0, max: 100 },   // Computed before save
    aiInsight:         { type: String },                        // Optional cached AI text
  },
  { timestamps: true }
);

// Compute sustainability score before saving
wasteLogSchema.pre("save", function (next) {
  if (this.entries && this.entries.length > 0) {
    const totalPrepared = this.entries.reduce((s, e) => s + e.prepared, 0);
    const totalLeftover = this.entries.reduce((s, e) => s + e.leftover, 0);
    const wastePercent  = totalPrepared > 0 ? (totalLeftover / totalPrepared) * 100 : 0;
    // Score: 100 = 0% waste, 0 = 50%+ waste (linear clamp)
    this.sustainabilityScore = Math.max(0, Math.round(100 - wastePercent * 2));
  }
  next();
});

// Virtuals for summary
wasteLogSchema.virtual("totalPrepared").get(function () {
  return this.entries.reduce((s, e) => s + e.prepared, 0);
});
wasteLogSchema.virtual("totalLeftover").get(function () {
  return this.entries.reduce((s, e) => s + e.leftover, 0);
});
wasteLogSchema.virtual("wastePercent").get(function () {
  return this.totalPrepared > 0
    ? Math.round((this.totalLeftover / this.totalPrepared) * 100 * 10) / 10
    : 0;
});

wasteLogSchema.set("toJSON", { virtuals: true });
wasteLogSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("WasteLog", wasteLogSchema);