const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    orders: {
      type: String,
    },
    tier: {
      type: Number,
    },
    pointsUsed: {
      type: Number,
    },
    coupon: {
      type: String,
    },
    userId: {
      type: String,
    },
    totalAmount: {
      type: Number,
    },
    amountPayed: {
      type: Number,
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Orders", orderSchema);
