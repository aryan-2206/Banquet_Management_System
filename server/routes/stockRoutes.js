const express = require("express");
const router  = express.Router();
const {
  getStock, getAlerts, getStockById,
  createStock, updateStock, adjustQuantity, deleteStock,
} = require("../controllers/stockController");

router.get("/",              getStock);
router.get("/alerts",        getAlerts);
router.get("/:id",           getStockById);
router.post("/",             createStock);
router.put("/:id",           updateStock);
router.patch("/:id/quantity",adjustQuantity);
router.delete("/:id",        deleteStock);

module.exports = router;