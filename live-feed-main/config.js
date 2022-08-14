// const env = process.env;
// const admin = require("./models/admin")

// module.exports = async function extractDBData() {

//     const sqlip = await admin.findById('6246aac68fb6f4bcda31ca15')
//     const config = {
//         db: { /* do not put password or any sensitive info here, done only for demo */
//             host: sqlip.host,
//             port: env.DB_PORT || '5432',
//             user: env.DB_USER || 'postgres',
//             password: env.DB_PASSWORD || 'aseem@Unfluke',
//         },
//         listPerPage: env.LIST_PER_PAGE || 10,
//     };
//     return config;
// }

'user strict';


const mongoose = require('mongoose');
const logger = require('pino')();
require('dotenv').config();



var db = mongoose.connection;

// var db_url = process.env.DATABASE;
// mongoose.connect(db_url, { useUnifiedTopology: true, useNewUrlParser: true, useFindAndModify: false }, (err) => {
//     if (err) {
//         logger.error(err);
//     } else {
//         logger.info("Mongodb Connected Successfully at " + db_url);
//     }
// });

module.exports['db'] = db;