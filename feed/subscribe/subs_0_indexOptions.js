// This Script is to subsribe to ticks data and save it in DB


const db            = require('../config/db');
const utils         = require("../utils");
const KiteTicker    = require("kiteconnect").KiteTicker;
const KiteConnect   = require("kiteconnect").KiteConnect;
const logger        = require("pino")();

const indexOptionsToSubscribe = require("../utils/indexOptionsToSubscribe");
logger.info("./subscribe/instrument1.js file Loaded sucessfully!!");


let LTP   = {};
let VWAP  = {};
let VOL   = {};
let OI    = {};

subscribe();

setTimeout(()=>{
    logger.info(LTP);
},10*1000);

async function subscribeAgain(){
    logger.info("------ subscribeAgain() --------- ");
    let wait = await utils.waitForXseconds(5);
    subscribe();
    return;
}

async function subscribe(){      

    try{        
        try{
            var params = await utils.getParams();
            logger.info({ "params" : params });
        }catch(err){
            logger.info("'Error while finding PARAMS Details in subscribe.js'  ");
            subscribeAgain();
            return 0;
        }  

        var apiKey = params.apikey;
        var accessToken = params.accesstoken;

        logger.info({"apiKey" : apiKey});        
        logger.info({"accessToken" : accessToken});
        
        try{
            // instrumentList must contain the exchange name eg. NSE:SBIN , NFO:NIFTY20D0312900CE
            var instrumentList =  await indexOptionsToSubscribe.getinstrumentsList();
            //logger.info( { "instrumentList" : instrumentList });

            var tokensDict     = await utils.getTokenList(apiKey,accessToken,instrumentList);
            logger.info({ "tokensDict" : tokensDict });

            logger.info("Expiry Details and Tokens found Correctly !! ");
        }catch(err){
            logger.info("Error:3 => Error  ",err);
            subscribeAgain();
            return 0;
        }  

        subscribeFeedandSaveInMemory(apiKey,accessToken,tokensDict);

    }
    catch(err){
        logger.info("Error in finding Tokens ",err);
    }

}

function subscribeFeedandSaveInMemory(apiKey,accessToken, tokensDict){
    logger.info("Started : subscribeFeedandSaveInMemory() ");

    let isSubscribed = false;
    let myTokens = Object.keys(tokensDict);

    for(let i=0; i<myTokens.length; i++) {
        myTokens[i] = parseInt(myTokens[i]);
    }

    let ticker = new KiteTicker({
        api_key: apiKey,
        access_token: accessToken
    });

    // set autoreconnect with 10 maximum reconnections and 5 second interval
    ticker.autoReconnect(true, 10, 5)
    ticker.connect();
    ticker.on("ticks", onTicks);
    ticker.on("connect", subscribe);

    ticker.on("reconnecting", function(reconnect_interval, reconnections) {
        logger.info("Reconnecting: attempt - ", reconnections, " innterval - ", reconnect_interval);
    });

    function onTicks(ticks) {
       
        if(isSubscribed == false){
            isSubscribed = true;
            logger.info("Subscribed Successfully ..!!");
        }

        logger.info({ 'message' : "Ticks length = " + ticks.length });

        ticks.forEach( async (tick)=>{

            let tmStmp = new Date();
              
            if (tick['tradable']== false){
                tmStmp = tick['timestamp'];
            }else{
                tmStmp = tick['last_trade_time'];
            }

            let instrument = tokensDict[tick['instrument_token']];
            LTP[instrument]  = tick['last_price'];
            VOL[instrument]  = tick['volume'];
            VWAP[instrument] = tick['average_price'];
            OI[instrument]   = tick['oi'];

            // let tickData = {
            //     name : tokensDict[tick['instrument_token']],
            //     token : tick['instrument_token'],
            //     timestamp : tmStmp,
            //     ltp : tick['last_price'],
            //     VWAP : vwap,
            //     OI : oi,
            //     volume : vol
            // }   

            // logger.info(tickData)
        })

    }

    function subscribe() {
        let dt = new Date();
        if(dt.getHours > 15 || ( dt.getHours() == 15 && dt.getMinutes() >= 31)){
            logger.info("Reached End of Day ");
        }else{
            isSubscribed = false;
            ticker.subscribe(myTokens);
            ticker.setMode(ticker.modeFull, myTokens);
        }
    }

}


function getLTP(instrument){
    if(LTP[instrument] == null || LTP[instrument] == undefined ){
        return -1;
    }else{
        return LTP[instrument];
    }
}
function getVWAP(instrument){
    if(VWAP[instrument] == null || VWAP[instrument] == undefined ){
        return -1;
    }else{
        return VWAP[instrument];
    }
}
function getVOL(instrument){
    if(VOL[instrument] == null || VOL[instrument] == undefined ){
        return -1;
    }else{
        return VOL[instrument];
    }
}
function getOI(instrument){
    if(OI[instrument] == null || OI[instrument] == undefined ){
        return -1;
    }else{
        return OI[instrument];
    }
}

module.exports['getLTP'] = getLTP;
module.exports['getVWAP'] = getVWAP;
module.exports['getVOL'] = getVOL;
module.exports['getOI'] = getOI;

