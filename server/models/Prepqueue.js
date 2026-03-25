const mongoose = require("mongoose");

const prepQueueSchema = new mongoose.Schema(
  {
    dishId:     { type: mongoose.Schema.Types.ObjectId, ref: "Dish", required: true },
    eventId:    { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    taskName:   { type: String, required: true },         // e.g. "Prep Dal Makhani"
    assignedTo: { type: String, trim: true },             // Chef name / station
    status:     { type: String, enum: ["pending", "active", "done"], default: "pending" },
    isUrgent:   { type: Boolean, default: false },
    scheduledAt:{ type: Date },
    startedAt:  { type: Date },
    completedAt:{ type: Date },
    notes:      { type: String },
  },
  { timestamps: true }
);

// Auto-set timestamps on status change
prepQueueSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    if (this.status === "active" && !this.startedAt)    this.startedAt   = new Date();
    if (this.status === "done"   && !this.completedAt)  this.completedAt = new Date();
  }
  next();
});

module.exports = mongoose.model("PrepQueue", prepQueueSchema);