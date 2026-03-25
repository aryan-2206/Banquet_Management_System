const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },   // "Mehta Wedding"
    type:        { type: String, enum: ["wedding", "corporate", "birthday", "other"], default: "other" },
    date:        { type: Date, required: true },
    venue:       { type: String, trim: true },
    plannedPax:  { type: Number, required: true, min: 1 },
    arrivedPax:  { type: Number, default: 0, min: 0 },
    status:      { type: String, enum: ["upcoming", "active", "completed", "cancelled"], default: "upcoming" },
    contactName: { type: String, trim: true },
    contactPhone:{ type: String, trim: true },
    notes:       { type: String },
  },
  { timestamps: true }
);

// Virtual: headcount delta warning flag
eventSchema.virtual("headcountWarning").get(function () {
  return Math.abs(this.plannedPax - this.arrivedPax) > 30;
});

eventSchema.set("toJSON", { virtuals: true });
eventSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Event", eventSchema);