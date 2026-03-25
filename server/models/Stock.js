const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema(
  {
    name:       { type: String, required: true, trim: true },
    category:   {
      type: String,
      enum: ["dairy", "produce", "protein", "spices", "grains", "oils", "condiments", "beverages", "other"],
      default: "other",
    },
    quantity:   { type: Number, required: true, min: 0 },
    unit:       { type: String, required: true },   // "kg", "L", "pcs"
    maxQuantity:{ type: Number, required: true },
    lowThreshold:     { type: Number, required: true },   // Below this = Low
    criticalThreshold:{ type: Number, required: true },   // Below this = Critical
    supplier:   { type: String, trim: true },
    lastRestocked: { type: Date },
    notes:      { type: String },
  },
  { timestamps: true }
);

// Virtual: computed level
stockSchema.virtual("level").get(function () {
  if (this.quantity <= this.criticalThreshold) return "Critical";
  if (this.quantity <= this.lowThreshold)      return "Low";
  return "Full";
});

// Virtual: fill percentage for the bar chart
stockSchema.virtual("fillPercent").get(function () {
  return Math.min(100, Math.round((this.quantity / this.maxQuantity) * 100));
});

stockSchema.set("toJSON", { virtuals: true });
stockSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Stock", stockSchema);