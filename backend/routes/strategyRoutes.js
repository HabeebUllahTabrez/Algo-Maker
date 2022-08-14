const express = require("express");
const router = express.Router();
const { getAllInstruments, getAllFutures, getAllStrategies, createStrategy, updateStrategy, deleteStrategy, toggleStrategy, getAllStrategiesForExecution, getAllFuturesExpiry, getAllFuturesTokens } = require("../controllers/strategiesController");
const {
    requireSignin,
    authMiddleware,
} = require("../controllers/authControllers");

router.get('/getAllInstruments', getAllInstruments);
router.get('/getAllFutures', getAllFutures);
router.get('/getAllFuturesExpiry', getAllFuturesExpiry);
router.get('/getAllFuturesTokens', getAllFuturesTokens);
router.get('/getAllStrategies/:id', requireSignin, authMiddleware, getAllStrategies);
router.post('/addStrategy', requireSignin, authMiddleware, createStrategy);
router.post('/updateStrategy/:id', requireSignin, authMiddleware, updateStrategy);
router.post('/toggleStrategy/:id', requireSignin, authMiddleware, toggleStrategy);
router.delete('/deleteStrategy/:id', requireSignin, authMiddleware, deleteStrategy);
router.get('/getAllStrategiesForExecution', getAllStrategiesForExecution);
module.exports = router;
