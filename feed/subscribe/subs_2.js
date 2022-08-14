// This Script is to subsribe to ticks data and save it in DB


const db = require('../config/db');
const utils = require("../utils");
const KiteTicker = require("kiteconnect").KiteTicker;
const KiteConnect = require("kiteconnect").KiteConnect;
const logger    = require("pino")();


logger.info("./subscribe/instrument1.js file Loaded sucessfully!!");


let LTP   = {};
let VWAP  = {};
let VOL   = {};
let OI    = {};

subscribe();



const instrumentList =  [
    "NSE:KOTAKBANK",
    "NSE:HDFCBANK" ,
    "NSE:ICICIBANK" ,
    "NSE:NIFTY BANK" ,
    "NSE:NIFTY 50" ,
    "MCX:GOLD22APRFUT",
    "MCX:GOLD22JUNFUT",
    "MCX:GOLD22AUGFUT",
    "MCX:GOLD22OCTFUT",                  
    "MCX:SILVER22MARFUT",
    "MCX:SILVER22MAYFUT",
    "MCX:SILVER22JULFUT",
    "MCX:SILVER22SEPFUT",
    "MCX:NATURALGAS22MARFUT",
    "MCX:NATURALGAS22APRFUT",
    "MCX:NATURALGAS22MAYFUT",
    "MCX:CRUDEOIL22MARFUT",
    "MCX:CRUDEOIL22APRFUT",
    "MCX:CRUDEOIL22MAYFUT",
    "MCX:CRUDEOIL22JUNFUT",
    "MCX:CRUDEOIL22JULFUT",
    "MCX:CRUDEOIL22AUGFUT",
    "MCX:ALUMINIUM22MARFUT",
    "MCX:ALUMINIUM22APRFUT",
    "MCX:ALUMINIUM22MAYFUT",
    "MCX:ALUMINIUM22JUNFUT",
    "MCX:ALUMINIUM22JULFUT",
    "MCX:COPPER22MARFUT",
    "MCX:COPPER22APRFUT",
    "MCX:COPPER22MAYFUT",
    "MCX:COPPER22JUNFUT",
    "MCX:COPPER22JULFUT",
    "MCX:ZINC22MARFUT",
    "MCX:ZINC22APRFUT",
    "MCX:ZINC22MAYFUT",
    "MCX:ZINC22JUNFUT",
    "MCX:ZINC22JULFUT",
    "NSE:KOTAKBANK",
    "NSE:HDFCBANK" ,
    "NSE:ICICIBANK" ,
    "NSE:ACC",
    "NSE:AUBANK",
    "NSE:AARTIIND",
    "NSE:ADANIENT",
    "NSE:ADANIGREEN",
    "NSE:ADANIPORTS",
    "NSE:ATGL",
    "NSE:ADANITRANS",
    "NSE:ABCAPITAL",
    "NSE:ABFRL",
    "NSE:AJANTPHARM",
    "NSE:APLLTD",
    "NSE:ALKEM",
    "NSE:AMARAJABAT",
    "NSE:AMBUJACEM",
    "NSE:APOLLOHOSP",
    "NSE:APOLLOTYRE",
    "NSE:ASHOKLEY",
    "NSE:ASIANPAINT",
    "NSE:ASTRAL",
    "NSE:AUROPHARMA",
    "NSE:DMART",
    "NSE:AXISBANK",
    "NSE:BAJAJ-AUTO",
    "NSE:BAJFINANCE",
    "NSE:BAJAJFINSV",
    "NSE:BAJAJHLDNG",
    "NSE:BALKRISIND",
    "NSE:BANDHANBNK",
    "NSE:BANKBARODA",
    "NSE:BANKINDIA",
    "NSE:BATAINDIA",
    "NSE:BERGEPAINT",
    "NSE:BEL",
    "NSE:BHARATFORG",
    "NSE:BHEL",
    "NSE:BPCL",
    "NSE:BHARTIARTL",
    "NSE:BIOCON",
    "NSE:BOSCHLTD",
    "NSE:BRITANNIA",
    "NSE:CADILAHC",
    "NSE:CANBK",
    "NSE:CASTROLIND",
    "NSE:CHOLAFIN",
    "NSE:CIPLA",
    "NSE:CUB",
    "NSE:COALINDIA",
    "NSE:COFORGE",
    "NSE:COLPAL",
    "NSE:CONCOR",
    "NSE:COROMANDEL",
    "NSE:CROMPTON",
    "NSE:CUMMINSIND",
    "NSE:DLF",
    "NSE:DABUR",
    "NSE:DALBHARAT",
    "NSE:DEEPAKNTR",
    "NSE:DHANI",
    "NSE:DIVISLAB",
    "NSE:DIXON",
    "NSE:LALPATHLAB",
    "NSE:DRREDDY",
    "NSE:EICHERMOT",
    "NSE:EMAMILTD",
    "NSE:ENDURANCE",
    "NSE:ESCORTS",
    "NSE:EXIDEIND",
    "NSE:FEDERALBNK",
    "NSE:FORTIS",
    "NSE:GAIL",
    "NSE:GLAND",
    "NSE:GLENMARK",
    "NSE:GODREJCP",
    "NSE:GODREJIND",
    "NSE:GODREJPROP",
    "NSE:GRASIM",
    "NSE:GUJGASLTD",
    "NSE:GSPL",
    "NSE:HCLTECH",
    "NSE:HDFCAMC",
    "NSE:HDFCBANK",
    "NSE:HDFCLIFE",
    "NSE:HAVELLS",
    "NSE:HEROMOTOCO",
    "NSE:HINDALCO",
    "NSE:HAL",
    "NSE:HINDCOPPER",
    "NSE:HINDPETRO",
    "NSE:HINDUNILVR",
    "NSE:HINDZINC",
    "NSE:HDFC",
    "NSE:ICICIBANK",
    "NSE:ICICIGI",
    "NSE:ICICIPRULI",
    "NSE:ISEC",
    "NSE:IDFCFIRSTB",
    "NSE:ITC",
    "NSE:INDIAMART",
    "NSE:INDIANB",
    "NSE:INDHOTEL",
    "NSE:IOC",
    "NSE:IRCTC",
    "NSE:IRFC",
    "NSE:IGL",
    "NSE:INDUSTOWER",
    "NSE:INDUSINDBK",
    "NSE:NAUKRI",
    "NSE:INFY",
    "NSE:INDIGO",
    "NSE:IPCALAB",
    "NSE:JSWENERGY",
    "NSE:JSWSTEEL",
    "NSE:JINDALSTEL",
    "NSE:JUBLFOOD",
    "NSE:KOTAKBANK",
    "NSE:L&TFH",
    "NSE:LTTS",
    "NSE:LICHSGFIN",
    "NSE:LTI",
    "NSE:LT",
    "NSE:LAURUSLABS",
    "NSE:LUPIN",
    "NSE:MRF",
    "NSE:MGL",
    "NSE:M&MFIN",
    "NSE:M&M",
    "NSE:MANAPPURAM",
    "NSE:MARICO",
    "NSE:MARUTI",
    "NSE:MFSL",
    "NSE:MINDTREE",
    "NSE:MPHASIS",
    "NSE:MUTHOOTFIN",
    "NSE:NATCOPHARM",
    "NSE:NMDC",
    "NSE:NTPC",
    "NSE:NATIONALUM",
    "NSE:NAVINFLUOR",
    "NSE:NESTLEIND",
    "NSE:NAM-INDIA",
    "NSE:OBEROIRLTY",
    "NSE:ONGC",
    "NSE:OIL",
    "NSE:PIIND",
    "NSE:PAGEIND",
    "NSE:PETRONET",
    "NSE:PFIZER",
    "NSE:PIDILITIND",
    "NSE:PEL",
    "NSE:POLYCAB",
    "NSE:PFC",
    "NSE:POWERGRID",
    "NSE:PRESTIGE",
    "NSE:PGHH",
    "NSE:PNB",
    "NSE:RBLBANK",
    "NSE:RECLTD",
    "NSE:RELIANCE",
    "NSE:SBICARD",
    "NSE:SBILIFE",
    "NSE:SRF",
    "NSE:SANOFI",
    "NSE:SHREECEM",
    "NSE:SRTRANSFIN",
    "NSE:SIEMENS",
    "NSE:SONACOMS",
    "NSE:SBIN",
    "NSE:SAIL",
    "NSE:SUNPHARMA",
    "NSE:SUNTV",
    "NSE:SYNGENE",
    "NSE:TVSMOTOR",
    "NSE:TATACHEM",
    "NSE:TATACOMM",
    "NSE:TCS",
    "NSE:TATACONSUM",
    "NSE:TATAELXSI",
    "NSE:TATAMOTORS",
    "NSE:TATAPOWER",
    "NSE:TATASTEEL",
    "NSE:TECHM",
    "NSE:RAMCOCEM",
    "NSE:TITAN",
    "NSE:TORNTPHARM",
    "NSE:TORNTPOWER",
    "NSE:TRENT",
    "NSE:UPL",
    "NSE:ULTRACEMCO",
    "NSE:UNIONBANK",
    "NSE:UBL",
    "NSE:MCDOWELL-N",
    "NSE:VBL",
    "NSE:VEDL",
    "NSE:IDEA",
    "NSE:VOLTAS",
    "NSE:WHIRLPOOL",
    "NSE:WIPRO",
    "NSE:YESBANK",
    "NSE:ZEEL"
];


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


function getinstrumentsList(){

    return instrumentList;
}

module.exports['getLTP'] = getLTP;
module.exports['getVWAP'] = getVWAP;
module.exports['getVOL'] = getVOL;
module.exports['getOI'] = getOI;

module.exports['getinstrumentsList'] = getinstrumentsList;

