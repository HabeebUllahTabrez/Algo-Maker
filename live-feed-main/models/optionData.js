const mongoose = require('mongoose');
const request = require('request');
const optionStockNames = mongoose.model('optionStockNames')
const optionExpiryTable = mongoose.model('optionExpiryTable')

const optionsData = mongoose.model('optionsData', new mongoose.Schema({
    // future: String,
    instrument_token: Number,
    minute: Date,
    open: Number,
    high: Number,
    low: Number,
    close: Number,
}, {
    timestamps: true
})
    .index({ instrument_token: 1, minute: 1 }, { unique: true })
)
module.exports = optionsData