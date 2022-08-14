const mongoose = require('mongoose')

const ConvForUserSchema = new mongoose.Schema({
    instrument_token: Number,
    minute: Date,
    open: Number,
    high: Number,
    low: Number,
    close: Number,
    volume: Number,
    oi: Number,
}, {
    timestamps: true
}).index({ instrument_token: 1, minute: 1 }, { unique: true })
const models = {};
const getModel = (collectionName) => {
    if (!(collectionName in models)) {
        models[collectionName] = mongoose.model(
            collectionName, ConvForUserSchema, collectionName
        );
    }
    return models[collectionName];
};

module.exports = getModel;