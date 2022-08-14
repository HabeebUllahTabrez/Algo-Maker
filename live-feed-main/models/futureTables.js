const mongoose = require('mongoose');


const futureTable = mongoose.model('futureTable', new mongoose.Schema({
    name: String,
    date: Date
}))

module.exports = futureTable