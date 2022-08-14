var mongoose = require("mongoose");
const db = require("../config/db");
var futures = new mongoose.Schema({
    future: String,
    instrument_token: Number
})
module.exports = mongoose.model("futures", futures);