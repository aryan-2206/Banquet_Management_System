const express = require("express");
const router  = express.Router();
const {
  getDishes, getDishById, createDish, bulkCreateDishes,
  updateDish, advanceDishStatus, updatePortions,
  getCourseSummary, deleteDish,
} = require("../controllers/dishController");

router.get("/",                         getDishes);
router.get("/event/:eventId/summary",   getCourseSummary);
router.get("/:id",                      getDishById);
router.post("/",                        createDish);
router.post("/bulk",                    bulkCreateDishes);
router.put("/:id",                      updateDish);
router.patch("/:id/status",             advanceDishStatus);
router.patch("/:id/portions",           updatePortions);
router.delete("/:id",                   deleteDish);

module.exports = router;
