const mongoose = require('mongoose');


const optionExpiryTable = mongoose.model('optionExpiryTable', new mongoose.Schema({
    name: String,
    date: Date
}))

module.exports = optionExpiryTable