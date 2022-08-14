const mongoose = require("mongoose");
const scannerSchema = new mongoose.Schema({}, { strict: false });
module.exports = mongoose.model("Scanners", scannerSchema);
