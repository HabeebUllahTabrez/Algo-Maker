const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.ObjectId

const tradingBuySell = mongoose.model("tradingBuySell", {
    userID: ObjectId,
    name: String,
    type: String,
    instrument_token: Number,
    marketSearch: String,
    qty: Number,
    price: Number,
    triggeredPrice: Number,
    product: {
        type: String,
        required: true
    },
    market: {
        type: Boolean,
        default: false
    },
    limit: {
        type: Boolean,
        default: false
    },
    slm: {
        type: Boolean,
        default: false
    },
    status: String,
    margin: Number,
    orderType: {
        type: String,
        default: 'open'
    },
    exchange: String,
    orderTime: {
        type: Date,
    },
    executedPrice: {
        type: Number,
        default: null
    }
})

module.exports = tradingBuySell