const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const strategySchema = new mongoose.Schema(
  {
    user: {
      type: ObjectId,
      ref: "User",
    },
    account: {
      type: ObjectId,
      ref: "Account",
    },
    orderId: {
      type: Number,
      required: true,
    },
    exchange: {
      type: String,
      required: true,
      enum: ["fut_fut", "fut_opt", "opt_opt"],
    },
    orderSymbol: String,
    orderType: {
      type: String,
      required: true,
      enum: ["MIS", "NRML", "CNC"],
    },
    direction: {
      type: String,
      required: true,
      enum: ["BUY", "SELL"],
    },
    price: Number,
    quantity: Number,
    remarks: String,
    status: String,
    pairId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", strategySchema);
