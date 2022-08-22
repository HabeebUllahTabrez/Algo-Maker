const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const strategySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  entryTime: {
    type: Date,
    required: true,
  },
  exitTime: {
    type: Date,
    required: true,
  },
  direction: {
    type: String,
    required: true,
    enum: ["BUY", "SELL", "BOTH"],
  },
  timeFrame: {
    type: String,
    required: true,
  },
  orderType: {
    type: String,
    required: true,
    enum: ["MIS", "NRML", "CNC"],
  },
  quantity: {
    type: Number,
    required: true,
  },
  stopLoss: {
    type: Number,
    required: true,
  },
  target: {
    type: Number,
    required: true,
  },
  exchange: {
    type: String,
    required: true,
    enum: ["fut_fut", "fut_opt", "opt_opt"],
  },
  dataSymbol: {
    type: String,
    required: true,
  },
  orderSymbol: {
    type: String,
    required: true,
  },
  indicators: [
    {
      indicator: String,
      param1: Number,
      param2: Number,
      operator1: String,
      operator2: String,
      value1: Number,
      value2: Number,
    },
  ],
  user: {
    type: ObjectId,
    ref: "User",
  },
  active: {
    type: Boolean,
    default: true,
  },
  maxOrders: {
    type: Number,
    required: true,
  },
  targetUnit: {
    type: String,
    enum: ["%", "Rs"],
  },
  stopLossUnit: {
    type: String,
    enum: ["%", "Rs"],
  },
  trailSLXPoint: {
    type: Number,
    required: true,
  },
  trailSLYPoint: {
    type: Number,
    required: true,
  },
  ce_pe: {
    type: String,
    enum: ["ce", "pe"],
  },
});

module.exports = mongoose.model("Strategy", strategySchema);
