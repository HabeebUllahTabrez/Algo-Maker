const mongoose = require('mongoose');


const optionStockNames = mongoose.model('optionStockNames', new mongoose.Schema({
    option
        :
        String,
    multiple
        :
        Number,
    start
        :
        Number,
    difference
        :
        Number,
    up
        :
        Number,
    down
        :
        Number,
    'sell leverage'
        :
        Number,
    'buy leverage'
        :
        Number,
    ce
        :
        Number,
    pe
        :
        Number,
}))

module.exports = optionStockNames