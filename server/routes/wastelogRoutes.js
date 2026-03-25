const express = require("express");
const router  = express.Router();
const {
  getWasteLogs, getWasteLogById, getPrefillData,
  createWasteLog, updateWasteLog, saveAiInsight, deleteWasteLog,
} = require("../controllers/wastelogController");

router.get("/",                    getWasteLogs);
router.get("/prefill/:eventId",    getPrefillData);
router.get("/:id",                 getWasteLogById);
router.post("/",                   createWasteLog);
router.put("/:id",                 updateWasteLog);
router.patch("/:id/ai-insight",    saveAiInsight);
router.delete("/:id",              deleteWasteLog);

module.exports = router;