const Strategy = require("../models/strategies");
const FuturesNames = require("../models/futures");
const FuturesExpiry = require("../models/futuresexpiry");
const FuturesToken = require("../models/futuresToken");
const ObjectId = require("mongoose").Types.ObjectId;
const Account = require("../models/accounts");
const utils = require("../utils");

exports.getAllStrategies = async (req, res) => {
  try {
    let user = req.params.id;
    let strategies = await Strategy.find({ user: user });
    res.json(strategies);
  } catch (error) {
    res.json({
      message: error.message,
    });
  }
};

exports.createStrategy = async (req, res) => {
  let strategy = new Strategy({
    name: req.body.name, //
    exchange: req.body.exchange, //
    dataSymbol: req.body.dataSymbol, //
    orderSymbol: req.body.orderSymbol, //
    timeFrame: req.body.timeFrame, //
    direction: req.body.direction, //
    entryTime: req.body.entryTime, //
    exitTime: req.body.exitTime, //
    stopLoss: req.body.stopLoss, //
    target: req.body.target, //
    orderType: req.body.orderType, //
    quantity: req.body.quantity, //
    stopLossUnit: req.body.stopLossUnit, //
    targetUnit: req.body.targetUnit, //
    active: req.body.active, // expecting from the frontend
    user: ObjectId(req.body.user), // expecting userid from frontend
    trailSLXPoint: req.body.trailSLXPoint, //
    trailSLYPoint: req.body.trailSLYPoint, //
    indicators: req.body.indicators,
    maxOrders: req.body.maxOrders,
    ce_pe: req.body.ce_pe,
  });

  strategy
    .save()
    .then((result) => {
      // console.log( "Strategy created successfully!", result)
      res.json({
        message: "Strategy created successfully!",
        stratgy: result,
      });
    })
    .catch((error) => {
      console.log(error);
      res.json({
        message: "Error while creating strategy!",
        error: error,
      });
    });
};

exports.updateStrategy = async (req, res) => {
  try {
    const id = req.params.id;
    let updatedStrategy = await Strategy.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.json({
      message: "Strategy updated successfully!",
      stratgy: updatedStrategy,
    });
  } catch (error) {
    res.json({
      message: "Error while updating strategy!",
      error: error,
    });
  }
};

exports.getAllStrategiesForExecution = async (req, res) => {
  try {
    let strategies = await Strategy.find({ active: true })
      .populate("user")
      .populate("account");

    res.json(strategies);
  } catch (error) {
    res.json({
      message: "Error while fetching strategies!",
      error: error,
    });
  }
};

exports.toggleStrategy = async (req, res) => {
  try {
    const id = req.params.id;
    let strategy = await Strategy.findById(id);
    strategy.active = !strategy.active;
    let updatedStrategy = await strategy.save();
    res.json({
      message: "Strategy updated successfully!",
      stratgy: updatedStrategy,
    });
  } catch (error) {
    res.json({
      message: "Error while updating strategy!",
      error: error,
    });
  }
};

exports.deleteStrategy = async (req, res) => {
  try {
    const id = req.params.id;
    let deletedStrategy = await Strategy.findByIdAndDelete(id);
    res.json({
      message: "Strategy deleted successfully!",
      stratgy: deletedStrategy,
    });
  } catch (error) {
    res.json({
      message: "Error while deleting strategy!",
      error: error,
    });
  }
};

exports.getAllInstruments = async (req, res) => {
  try {
    let instruments = await utils.getAllInstruments();
    console.log(instruments);
    res.json(instruments);
  } catch (error) {
    res.json({
      message: "Error while fetching instruments!",
      error: error,
    });
  }
};
exports.getAllFutures = async (req, res) => {
  FuturesNames.find({})
    .then((data) => {
      res.json(data);
    })
    .catch((e) => {
      res.json({
        message: "Error while fetching Futures!",
        error: error,
      });
    });
};
exports.getAllFuturesExpiry = async (req, res) => {
  const today = new Date().setHours(0, 0, 0, 0);
  FuturesExpiry.find({
    date: { $gte: today },
  })
    .sort()
    .then((data) => {
      res.json(data[0].name);
    })
    .catch((e) => {
      res.json({
        message: "Error while fetching Futures Expiries!",
        error: e,
      });
    });
};
exports.getAllFuturesTokens = async (req, res) => {
  try {
    let futures = await FuturesTokens.find({});
    // console.log(futures)
    res.json(futures);
  } catch (error) {
    res.json({
      message: "Error while fetching Futures Tokens!",
      error: error,
    });
  }
};
