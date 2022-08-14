const db = require("../config/db");
var mongoose = require("mongoose");

var adminSchema = new mongoose.Schema({
    userID : String,
    password : String,
    pin : String,
    apikey : String , 
    secret : String , 
    access_token : String ,
    enctoken : String,
    auth_type : String,
    totp_secret : String
})
module.exports = mongoose.model("admins", adminSchema);