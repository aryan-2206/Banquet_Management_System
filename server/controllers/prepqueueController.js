const PrepQueue = require("../models/Prepqueue");

// GET /api/prep-queue?eventId=xxx&status=pending&urgent=true
exports.getPrepQueue = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.eventId) filter.eventId = req.query.eventId;
    if (req.query.status)  filter.status  = req.query.status;
    if (req.query.urgent === "true") filter.isUrgent = true;

    const tasks = await PrepQueue.find(filter)
      .populate("dishId", "name course")
      .populate("eventId", "name")
      .sort({ isUrgent: -1, scheduledAt: 1, createdAt: 1 });

    res.json(tasks);
  } catch (err) { next(err); }
};

// GET /api/prep-queue/dashboard-kpi — counts for KPI cards
exports.getKPICounts = async (req, res, next) => {
  try {
    const [pending, active, done, urgent] = await Promise.all([
      PrepQueue.countDocuments({ status: "pending" }),
      PrepQueue.countDocuments({ status: "active" }),
      PrepQueue.countDocuments({ status: "done" }),
      PrepQueue.countDocuments({ isUrgent: true, status: { $ne: "done" } }),
    ]);
    res.json({ pending, active, done, urgent });
  } catch (err) { next(err); }
};

// POST /api/prep-queue
exports.createTask = async (req, res, next) => {
  try {
    const task = await PrepQueue.create(req.body);
    res.status(201).json(task);
  } catch (err) { next(err); }
};

// PATCH /api/prep-queue/:id/status
exports.updateTaskStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const task = await PrepQueue.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    task.status = status;
    await task.save();  // pre-save hook sets timestamps
    res.json(task);
  } catch (err) { next(err); }
};

// PATCH /api/prep-queue/:id/urgent
exports.toggleUrgent = async (req, res, next) => {
  try {
    const task = await PrepQueue.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    task.isUrgent = !task.isUrgent;
    await task.save();
    res.json(task);
  } catch (err) { next(err); }
};

// DELETE /api/prep-queue/:id
exports.deleteTask = async (req, res, next) => {
  try {
    await PrepQueue.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted" });
  } catch (err) { next(err); }
};