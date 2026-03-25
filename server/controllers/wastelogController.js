const WasteLog = require("../models/WasteLog");
const Dish = require("../models/Menu");

// GET /api/waste-logs?eventId=xxx
exports.getWasteLogs = async (req, res, next) => {
    try {
        const filter = {};
        if (req.query.eventId) filter.eventId = req.query.eventId;
        const logs = await WasteLog.find(filter).populate("eventId", "name date").sort({ date: -1 });
        res.json(logs);
    } catch (err) { next(err); }
};

// GET /api/waste-logs/:id
exports.getWasteLogById = async (req, res, next) => {
    try {
        const log = await WasteLog.findById(req.params.id).populate("eventId");
        if (!log) return res.status(404).json({ message: "Waste log not found" });
        res.json(log);
    } catch (err) { next(err); }
};

// GET /api/waste-logs/prefill/:eventId — return dish rows pre-filled for WasteLogger.jsx
exports.getPrefillData = async (req, res, next) => {
    try {
        const dishes = await Dish.find({ eventId: req.params.eventId }).sort({ course: 1 });

        // Check if a draft log already exists for today
        const today = new Date();
        const existing = await WasteLog.findOne({
            eventId: req.params.eventId,
            date: {
                $gte: new Date(today.setHours(0, 0, 0, 0)),
                $lt: new Date(today.setHours(23, 59, 59, 999)),
            },
        });

        const rows = dishes.map(d => {
            const existingEntry = existing?.entries.find(e => String(e.dishId) === String(d._id));
            return {
                dishId: d._id,
                dishName: d.name,
                course: d.course,
                prepared: existingEntry?.prepared ?? d.portions.prepared,
                leftover: existingEntry?.leftover ?? 0,
                reason: existingEntry?.reason ?? "over-prepared",
            };
        });

        res.json({ rows, existingLogId: existing?._id ?? null });
    } catch (err) { next(err); }
};

// POST /api/waste-logs — create new log (sustainability score auto-computed in model)
exports.createWasteLog = async (req, res, next) => {
    try {
        const log = await WasteLog.create(req.body);
        res.status(201).json(log);
    } catch (err) { next(err); }
};

// PUT /api/waste-logs/:id — update / resubmit
exports.updateWasteLog = async (req, res, next) => {
    try {
        // findByIdAndUpdate bypasses pre-save hooks, so update manually
        const log = await WasteLog.findById(req.params.id);
        if (!log) return res.status(404).json({ message: "Waste log not found" });
        Object.assign(log, req.body);
        await log.save();  // triggers pre-save score recalculation
        res.json(log);
    } catch (err) { next(err); }
};

// PATCH /api/waste-logs/:id/ai-insight — cache AI insight text
exports.saveAiInsight = async (req, res, next) => {
    try {
        const log = await WasteLog.findByIdAndUpdate(
            req.params.id,
            { aiInsight: req.body.insight },
            { new: true }
        );
        if (!log) return res.status(404).json({ message: "Waste log not found" });
        res.json(log);
    } catch (err) { next(err); }
};

// DELETE /api/waste-logs/:id
exports.deleteWasteLog = async (req, res, next) => {
    try {
        await WasteLog.findByIdAndDelete(req.params.id);
        res.json({ message: "Waste log deleted" });
    } catch (err) { next(err); }
};