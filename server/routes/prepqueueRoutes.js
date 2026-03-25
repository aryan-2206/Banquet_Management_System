const express = require("express");
const router  = express.Router();
const {
  getPrepQueue, getKPICounts,
  createTask, updateTaskStatus, toggleUrgent, deleteTask,
} = require("../controllers/prepqueueController");

router.get("/",             getPrepQueue);
router.get("/kpi",          getKPICounts);
router.post("/",            createTask);
router.patch("/:id/status", updateTaskStatus);
router.patch("/:id/urgent", toggleUrgent);
router.delete("/:id",       deleteTask);

module.exports = router;