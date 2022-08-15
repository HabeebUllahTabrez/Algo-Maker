"user strict";

const nconf = require("nconf");
const path = require("path");
const mongoose = require("mongoose");
// var firebase = require("firebase/app");
const logger = require("pino")();
require("dotenv").config();

var db = mongoose.connection;

var db_url = process.env.DB_HOST;
mongoose.connect(
  db_url,
  { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false },
  (err) => {
    if (err) {
      logger.error(err);
    } else {
      logger.info("Mongodb Connected Successfully at " + db_url);
    }
  }
);

module.exports["db"] = db;

//-----------------------------------------------------------FirebaseConfiguration-------------------------------------------------------//

// require("firebase/auth");
// var firebaseConfig = nconf.get("FIREBASE_CONFIG");
// firebase.initializeApp(firebaseConfig);
// logger.info("Firebase Initialized Successfully!!");

//---------------------------------------------------------------------------------------------------------------------------------------//
