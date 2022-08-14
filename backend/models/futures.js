var mongoose = require("mongoose");
const db = require("../config/db");
var futureNames = new mongoose.Schema({
    future: String,
    multiple: Number
})
module.exports = mongoose.model("futurenames", futureNames);