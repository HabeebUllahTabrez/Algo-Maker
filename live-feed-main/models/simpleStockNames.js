const mongoose = require('mongoose');


const simpleStockName = mongoose.model('simpleStockNames', new mongoose.Schema({
    equity: String,
    instrument_token: Number,
    multiple: Number,
    leverage: Number
}))

module.exports = simpleStockName