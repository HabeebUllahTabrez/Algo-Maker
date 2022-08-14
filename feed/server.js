'use strict';

const   express        = require('express'),
        bodyParser     = require('body-parser'),
        path            = require('path'),
        db             = require('./config/db'),
        logger            = require('pino')();


require('dotenv').config()


const app = express();
app.set("view engine","ejs");
app.set('views',__dirname + "/views");
app.set('views', path.join(__dirname, 'views'));
app.use( express.static( "public" ) );
app.use(bodyParser.urlencoded({extended: true}));


var cors = require('cors');
app.use(cors())


require('./routes/API')(app);

const PORT = process.env.PORT || 4007 ; 
const IP = "localhost";
app.listen(PORT ,(err)=>{
    if(err){
        logger.info("Some Error occured while starting Server ",err);
    }
    logger.info("Server Started at http://"+ IP + ":" +PORT);
}) 
