const express = require("express");
const router  = express.Router();
const {
  getEvents, getTodayEvents, getEventById,
  createEvent, updateEvent, updateArrivedPax, deleteEvent,
} = require("../controllers/eventController");

router.get("/",         getEvents);
router.get("/today",    getTodayEvents);
router.get("/:id",      getEventById);
router.post("/",        createEvent);
router.put("/:id",      updateEvent);
router.patch("/:id/arrived", updateArrivedPax);
router.delete("/:id",   deleteEvent);

module.exports = router;