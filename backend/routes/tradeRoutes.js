const express = require("express");
const router = express.Router();
const { getAllTrades,createTrade} = require("../controllers/tradesController");
const {
    requireSignin,
    authMiddleware,
} = require("../controllers/authControllers");

router.get("/getAllTrades/:id", requireSignin, authMiddleware, getAllTrades);
router.post("/createTrade", createTrade);




module.exports = router;
