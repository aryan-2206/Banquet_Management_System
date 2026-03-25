const Event = require("../models/Event");

// GET /api/events — optionally filter by ?date=YYYY-MM-DD or ?status=active
exports.getEvents = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.date) {
      const d = new Date(req.query.date);
      filter.date = { $gte: new Date(d.setHours(0,0,0,0)), $lt: new Date(d.setHours(23,59,59,999)) };
    }
    const events = await Event.find(filter).sort({ date: 1 });
    res.json(events);
  } catch (err) { next(err); }
};

// GET /api/events/today
exports.getTodayEvents = async (req, res, next) => {
  try {
    const today = new Date();
    const events = await Event.find({
      date: {
        $gte: new Date(today.setHours(0,0,0,0)),
        $lt:  new Date(today.setHours(23,59,59,999)),
      },
    });
    res.json(events);
  } catch (err) { next(err); }
};

// GET /api/events/:id
exports.getEventById = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) { next(err); }
};

// POST /api/events
exports.createEvent = async (req, res, next) => {
  try {
    const event = await Event.create(req.body);
    res.status(201).json(event);
  } catch (err) { next(err); }
};

// PUT /api/events/:id
exports.updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) { next(err); }
};

// PATCH /api/events/:id/arrived — update arrived pax only
exports.updateArrivedPax = async (req, res, next) => {
  try {
    const { arrivedPax } = req.body;
    const event = await Event.findByIdAndUpdate(
      req.params.id,
      { arrivedPax },
      { new: true, runValidators: true }
    );
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json(event);
  } catch (err) { next(err); }
};

// DELETE /api/events/:id
exports.deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    res.json({ message: "Event deleted" });
  } catch (err) { next(err); }
};