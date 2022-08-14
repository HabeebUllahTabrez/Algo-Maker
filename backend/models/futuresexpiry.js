var mongoose = require("mongoose");
const db = require("../config/db");
var futureExpiry = new mongoose.Schema({
    date: Date,
    name: String
})
module.exports = mongoose.model("futureexpiries", futureExpiry);