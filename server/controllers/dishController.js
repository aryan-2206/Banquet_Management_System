const Dish = require("../models/Menu");

// GET /api/dishes?eventId=xxx&course=mains&status=Active
exports.getDishes = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.eventId) filter.eventId = req.query.eventId;
    if (req.query.course)  filter.course  = req.query.course;
    if (req.query.status)  filter.status  = req.query.status;
    const dishes = await Dish.find(filter).sort({ sortOrder: 1, course: 1 });
    res.json(dishes);
  } catch (err) { next(err); }
};

// GET /api/dishes/:id
exports.getDishById = async (req, res, next) => {
  try {
    const dish = await Dish.findById(req.params.id).populate("stockRefs");
    if (!dish) return res.status(404).json({ message: "Dish not found" });
    res.json(dish);
  } catch (err) { next(err); }
};

// POST /api/dishes
exports.createDish = async (req, res, next) => {
  try {
    const dish = await Dish.create(req.body);
    res.status(201).json(dish);
  } catch (err) { next(err); }
};

// POST /api/dishes/bulk — create multiple dishes at once
exports.bulkCreateDishes = async (req, res, next) => {
  try {
    const dishes = await Dish.insertMany(req.body);
    res.status(201).json(dishes);
  } catch (err) { next(err); }
};

// PUT /api/dishes/:id
exports.updateDish = async (req, res, next) => {
  try {
    const dish = await Dish.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!dish) return res.status(404).json({ message: "Dish not found" });
    res.json(dish);
  } catch (err) { next(err); }
};

// PATCH /api/dishes/:id/status — advance status one step
exports.advanceDishStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // Accept explicit status or auto-advance
    const dish = await Dish.findById(req.params.id);
    if (!dish) return res.status(404).json({ message: "Dish not found" });

    const steps = ["Pending", "Active", "Served", "Closed"];
    const nextStatus = status || steps[steps.indexOf(dish.status) + 1] || dish.status;
    dish.status = nextStatus;
    await dish.save();
    res.json(dish);
  } catch (err) { next(err); }
};

// PATCH /api/dishes/:id/portions — increment portions served
exports.updatePortions = async (req, res, next) => {
  try {
    const { prepared, served } = req.body;
    const update = {};
    if (prepared !== undefined) update["portions.prepared"] = prepared;
    if (served   !== undefined) update["portions.served"]   = served;
    const dish = await Dish.findByIdAndUpdate(req.params.id, { $set: update }, { new: true });
    if (!dish) return res.status(404).json({ message: "Dish not found" });
    res.json(dish);
  } catch (err) { next(err); }
};

// GET /api/dishes/event/:eventId/summary — course-grouped summary for manifest
exports.getCourseSummary = async (req, res, next) => {
  try {
    const summary = await Dish.aggregate([
      { $match: { eventId: require("mongoose").Types.ObjectId(req.params.eventId) } },
      {
        $group: {
          _id: "$course",
          total:  { $sum: 1 },
          served: { $sum: { $cond: [{ $eq: ["$status", "Served"] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ["$status", "Closed"] }, 1, 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    res.json(summary);
  } catch (err) { next(err); }
};

// DELETE /api/dishes/:id
exports.deleteDish = async (req, res, next) => {
  try {
    await Dish.findByIdAndDelete(req.params.id);
    res.json({ message: "Dish deleted" });
  } catch (err) { next(err); }
};