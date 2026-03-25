const mongoose = require("mongoose");

const menubarSchema = new mongoose.Schema(
  {
    eventId:    { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    name:       { type: String, required: true, trim: true },
    course:     {
      type: String,
      enum: ["starters", "soup", "mains", "breads", "rice", "desserts", "beverages", "live-counter"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Active", "Served", "Closed"],
      default: "Pending",
    },
    portions: {
      prepared: { type: Number, default: 0 },
      served:   { type: Number, default: 0 },
    },
    dietaryTags: [{ type: String, enum: ["veg", "non-veg", "vegan", "jain", "gluten-free", "dairy-free", "nut-free"] }],
    stockRefs:   [{ type: mongoose.Schema.Types.ObjectId, ref: "Stock" }],  // Linked ingredients
    batchGroup:  { type: String },   // e.g. "gravy-base" — menubares sharing same prep batch
    isUrgent:    { type: Boolean, default: false },
    sortOrder:   { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Menu", menubarSchema);