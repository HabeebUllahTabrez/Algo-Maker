const mongoose = require('mongoose');
const request = require('request');


const futuresData = mongoose.model('futuresData', new mongoose.Schema({
    // future: String,
    instrument_token: Number,
    minute: Date,
    open: Number,
    high: Number,
    low: Number,
    close: Number,
    //     }
    // ]

}, {
    timestamps: true
})
    .index({ instrument_token: 1, minute: 1 }, { unique: true })
)

module.exports = futuresData