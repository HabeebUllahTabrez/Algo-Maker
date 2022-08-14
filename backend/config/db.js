'user strict';


const mongoose = require('mongoose');
const logger = require('pino')();
require('dotenv').config({ path: "../.env" });



var db = mongoose.connection;

var db_url = process.env.DATABASE;
mongoose.connect(db_url, { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false }, (err) => {
    if (err) {
        logger.error(err);
    } else {
        logger.info("Mongodb Connected Successfully at " + db_url);
    }
});

module.exports['db'] = db;