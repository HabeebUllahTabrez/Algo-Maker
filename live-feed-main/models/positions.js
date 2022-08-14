const mongoose = require("mongoose")
const ObjectId = mongoose.Schema.ObjectId

const positions = mongoose.model("positions", {
    userId: {
        type: ObjectId,
        required: true
    },
    instrument: {
        type: String,
        required: true
    },
    instrument_token: {
        type: Number,
        required: true
    },
    product: {
        type: String,
        required: true
    },
    market: {
        type: String,
        required: true
    },
    net_qty: {
        type: Number,
        required: true,
    },
    avg: {
        type: Number,
        required: true,
    },
    buy_value: {
        type: Number,
        required: true,
    },
    sell_value: {
        type: Number,
        required: true,
    },
})
module.exports = positions