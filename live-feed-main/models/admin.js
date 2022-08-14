const mongoose = require('mongoose');


const admin = mongoose.model('admins', new mongoose.Schema({
    userID
        : String,
    password
        : String,
    pin
        : String,
    totp_secret
        : String,
    apikey
        : String,
    secret
        : String,
    access_token
        : String,
    auth_type
        : String,
    host: String
}))

module.exports = admin;