const express = require("express");
const router = express.Router();
const {
  getAllOrders,
  getTodaysOrders,
} = require("../controllers/orderController");
const {
  requireSignin,
  authMiddleware,
} = require("../controllers/authControllers");

router.get("/getAllTrades/:id", requireSignin, authMiddleware, getAllOrders);
router.get(
  "/getTodaysOrders/:id",
  requireSignin,
  authMiddleware,
  getTodaysOrders
);

module.exports = router;
