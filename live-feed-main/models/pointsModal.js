const mongoose = require("mongoose");

const pointsSchema = new mongoose.Schema({
  phone: {
    type: Number,
  },
  referral: {
    type: Number,
  },
  referee: {
    type: Number,
  },
});

module.exports = mongoose.model("Points", pointsSchema);
