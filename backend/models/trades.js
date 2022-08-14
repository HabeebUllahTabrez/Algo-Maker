const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const tradeSchema = new mongoose.Schema(
    {
        instrument: String,
        product: {
            type: String,
            enum: ["MIS", "CNC", "NRML"],
        },
        t_type: {
            type: String,
            enum: ["BUY", "SELL"],
        },
        order_type: {
            type: String,
            enum: ["MARKET", "SL-M", "LIMIT"],
        },
        price: Number,
        
        
        overallQty: Number,
        account: {
            type: ObjectId,
            ref: "Account",
        },
        status: {
            type: String,
            default: "PENDING",
            enum: ["SUCCESS", "ERROR", "PENDING"],
        },
        time: {
            type: Date,
            default: Date.now,
        },
        orderID: Number,

    },
    { timestamps: true }
);

module.exports = mongoose.model("Trade", tradeSchema);
