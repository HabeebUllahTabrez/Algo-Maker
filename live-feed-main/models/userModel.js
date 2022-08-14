const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter your name"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Please enter your email"],
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: [true, "Please enter your password"],
    },
    socketId: {
      type: String,
    },
    role: {
      type: Number,
      default: 0, //0 for user , 1 for admin
    },
    disable: {
      type: Boolean,
      default: false,
    },
    referralGot: {
      type: String,
    },
    tier: {
      type: Number,
      default: 0,
    },
    tierEnded: {
      type: String,
    },
    emailNotification: {
      type: Number,
      default: 5,
    },
    whatsappNotification: {
      type: Number,
      default: 5,
    },
    telegramNotification: {
      type: Number,
      default: 5,
    },
    virtualTrades: {
      type: Number,
      default: 200,
    },
    backtest: {
      type: Number,
      default: 2,
    },
    points: {
      type: Number,
      default: 0,
    },
    hisReferral: {
      type: "String",
    },
    phoneNos: {
      type: "String",
    },
    phoneVerified: {
      type: Boolean,
      default: false,
    },
    alertWhatsapp: {
      type: Number,
      default: -1, //0 for whatsapp , 1 for telegram , 2 for email
    },
    alertEmail: {
      type: Number,
      default: -1, //0 for whatsapp , 1 for telegram , 2 for email
    },
    alertTelegram: {
      type: Number,
      default: -1, //0 for whatsapp , 1 for telegram , 2 for email
    },
    telegramChatID: {
      type: String,
    },
    telegramUsername: {
      type: String,
    },
    tierExpired: {
      type: Boolean,
      default: false,
    },
    referralSend: [String],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Users", userSchema);
