const Stock = require("../models/Stock");

// GET /api/stock?level=Critical&category=dairy
exports.getStock = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;

    let items = await Stock.find(filter).sort({ name: 1 });

    // Filter by virtual level if requested
    if (req.query.level) {
      items = items.filter(i => i.level === req.query.level);
    }

    res.json(items);
  } catch (err) { next(err); }
};

// GET /api/stock/alerts — only Low + Critical items
exports.getAlerts = async (req, res, next) => {
  try {
    const all = await Stock.find({});
    const alerts = all.filter(i => i.level === "Low" || i.level === "Critical");
    res.json({ count: alerts.length, items: alerts });
  } catch (err) { next(err); }
};

// GET /api/stock/:id
exports.getStockById = async (req, res, next) => {
  try {
    const item = await Stock.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Stock item not found" });
    res.json(item);
  } catch (err) { next(err); }
};

// POST /api/stock
exports.createStock = async (req, res, next) => {
  try {
    const item = await Stock.create(req.body);
    res.status(201).json(item);
  } catch (err) { next(err); }
};

// PUT /api/stock/:id
exports.updateStock = async (req, res, next) => {
  try {
    const item = await Stock.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!item) return res.status(404).json({ message: "Stock item not found" });
    res.json(item);
  } catch (err) { next(err); }
};

// PATCH /api/stock/:id/quantity — adjust quantity (restock or consume)
exports.adjustQuantity = async (req, res, next) => {
  try {
    const { delta, absolute } = req.body;  // delta: ±N, absolute: set exact value
    const item = await Stock.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Stock item not found" });

    if (absolute !== undefined) {
      item.quantity = absolute;
    } else if (delta !== undefined) {
      item.quantity = Math.max(0, item.quantity + delta);
    }
    if (delta > 0 || (absolute !== undefined && absolute > item.quantity)) {
      item.lastRestocked = new Date();
    }
    await item.save();
    res.json(item);
  } catch (err) { next(err); }
};

// DELETE /api/stock/:id
exports.deleteStock = async (req, res, next) => {
  try {
    await Stock.findByIdAndDelete(req.params.id);
    res.json({ message: "Stock item deleted" });
  } catch (err) { next(err); }
};