const params            = require("../models/params");
const instrumentID      = require("../data/instrumentID.js");
const fetch             = require("node-fetch");
const expiryUtil        = require("./expiry");
const logger            = require("pino")();
const utils             = require("./index");

var daily = [ "00","01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31"]
var weekly  = ["1","2","3","4","5","6","7","8","9","O","N","D"];
var monthly = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
var allFutures = [ "NFO:ALKEM","NFO:APLLTD","NFO:AUBANK","NFO:CUB","NFO:DEEPAKNTR","NFO:GRANULES","NFO:GUJGASLTD","NFO:IRCTC","NFO:LTI","NFO:LTTS","NFO:MPHASIS","NFO:NAM-INDIA","NFO:NAVINFLUOR","NFO:PFIZER","NFO:PIIND","NFO:TRENT","NFO:BANKNIFTY","NFO:FINNIFTY","NFO:NIFTY","NFO:AARTIIND","NFO:ACC","NFO:ADANIENT","NFO:ADANIPORTS","NFO:AMARAJABAT","NFO:AMBUJACEM","NFO:APOLLOHOSP","NFO:APOLLOTYRE","NFO:ASHOKLEY","NFO:ASIANPAINT","NFO:AUROPHARMA","NFO:AXISBANK","NFO:BAJAJ-AUTO","NFO:BAJAJFINSV","NFO:BAJFINANCE","NFO:BALKRISIND","NFO:BANDHANBNK","NFO:BANKBARODA","NFO:BATAINDIA","NFO:BEL","NFO:BERGEPAINT","NFO:BHARATFORG","NFO:BHARTIARTL","NFO:BHEL","NFO:BIOCON","NFO:BOSCHLTD","NFO:BPCL","NFO:BRITANNIA","NFO:CADILAHC","NFO:CANBK","NFO:CHOLAFIN","NFO:CIPLA","NFO:COALINDIA","NFO:COFORGE","NFO:COLPAL","NFO:CONCOR","NFO:CUMMINSIND","NFO:DABUR","NFO:DIVISLAB","NFO:DLF","NFO:DRREDDY","NFO:EICHERMOT","NFO:ESCORTS","NFO:EXIDEIND","NFO:FEDERALBNK","NFO:GAIL","NFO:GLENMARK","NFO:GMRINFRA","NFO:GODREJCP","NFO:GODREJPROP","NFO:GRASIM","NFO:HAVELLS","NFO:HCLTECH","NFO:HDFC","NFO:HDFCAMC","NFO:HDFCBANK","NFO:HDFCLIFE","NFO:HEROMOTOCO","NFO:HINDALCO","NFO:HINDPETRO","NFO:HINDUNILVR","NFO:IBULHSGFIN","NFO:ICICIBANK","NFO:ICICIGI","NFO:ICICIPRULI","NFO:IDEA","NFO:IDFCFIRSTB","NFO:IGL","NFO:INDIGO","NFO:INDUSINDBK","NFO:INDUSTOWER","NFO:INFY","NFO:IOC","NFO:ITC","NFO:JINDALSTEL","NFO:JSWSTEEL","NFO:JUBLFOOD","NFO:KOTAKBANK","NFO:L&amp;TFH","NFO:LALPATHLAB","NFO:LICHSGFIN","NFO:LT","NFO:LUPIN","NFO:M&amp;M","NFO:M&amp;MFIN","NFO:MANAPPURAM","NFO:MARICO","NFO:MARUTI","NFO:MCDOWELL-N","NFO:MFSL","NFO:MGL","NFO:MINDTREE","NFO:MOTHERSUMI","NFO:MRF","NFO:MUTHOOTFIN","NFO:NATIONALUM","NFO:NAUKRI","NFO:NESTLEIND","NFO:NMDC","NFO:NTPC","NFO:ONGC","NFO:PAGEIND","NFO:PEL","NFO:PETRONET","NFO:PFC","NFO:PIDILITIND","NFO:PNB","NFO:POWERGRID","NFO:PVR","NFO:RAMCOCEM","NFO:RBLBANK","NFO:RECLTD","NFO:RELIANCE","NFO:SAIL","NFO:SBILIFE","NFO:SBIN","NFO:SHREECEM","NFO:SIEMENS","NFO:SRF","NFO:SRTRANSFIN","NFO:SUNPHARMA","NFO:SUNTV","NFO:TATACHEM","NFO:TATACONSUM","NFO:TATAMOTORS","NFO:TATAPOWER","NFO:TATASTEEL","NFO:TCS","NFO:TECHM","NFO:TITAN","NFO:TORNTPHARM","NFO:TORNTPOWER","NFO:TVSMOTOR","NFO:UBL","NFO:ULTRACEMCO","NFO:UPL","NFO:VEDL","NFO:VOLTAS","NFO:WIPRO","NFO:ZEEL"];


function indexOptionsToSubscribe(){

    // Find expiry details and make symbols to subscribe 
    // Find the pre market opening Price of NIF and BNF and find tokens for +-5 strikes above that 

    return new Promise( async (resolve,reject)=>{
        try{            

            var params = await utils.getParams();
            var apiKey = params.apikey;
            var accessToken = params.accesstoken;

            var instrumentList = ["NSE:RELIANCE", "NSE:NIFTY 50" , "NSE:NIFTY BANK"];

            expiry = await expiryUtil.getCurrentExpiryDetails();
            logger.info( { "expiry" : expiry });
          
            niftyFUT = "NFO:NIFTY"+ expiry.year + expiry.futExpiryMonth + "FUT";
            bnfFUT = "NFO:BANKNIFTY"+ expiry.year + expiry.futExpiryMonth + "FUT";

            // Add FUT of NIFTY and BNF 
            instrumentList.push(niftyFUT);
            instrumentList.push(bnfFUT);
            instrumentList.push("NFO:NIFTY"+ expiry.year + expiry.nextFutExpiryMonth + "FUT");
            instrumentList.push("NFO:BANKNIFTY"+ expiry.year + expiry.nextFutExpiryMonth + "FUT");

            // allFutures.forEach(futSym =>{
            //     var futName = futSym + expiry.year + expiry.futExpiryMonth + "FUT";
            //     instrumentList.push(futName);
            // })

            var niftyFUTprice = -1;
            var bnfFUTprice = -1;

            try{
                niftyFUTprice = await utils.findLTPthroughQuote(apiKey,accessToken,niftyFUT);
                bnfFUTprice  = await utils.findLTPthroughQuote(apiKey,accessToken,bnfFUT);
                console.log( "done ");
            }catch(err){
                logger.err({"message" : "Unable to find LTP through Quote " , err });
            }
            
            logger.info({ "niftyFUT" : niftyFUT, "niftyFUTprice" : niftyFUTprice } );
            logger.info({ "bnfFUT" : bnfFUT ,  "bnfFUTprice" : bnfFUTprice });

            // Add NIFTY option details 
            for(let i=-10;i<=10;i++){
                var strike = (parseInt(niftyFUTprice/100) + i)*100;
                var CEname = "NFO:NIFTY"+expiry.year+expiry.month+expiry.day+strike+"CE";
                var PEname = "NFO:NIFTY"+expiry.year+expiry.month+expiry.day+strike+"PE";
                var CEname50 = "NFO:NIFTY"+expiry.year+expiry.month+expiry.day+JSON.stringify(strike+50)+"CE";
                var PEname50 = "NFO:NIFTY"+expiry.year+expiry.month+expiry.day+JSON.stringify(strike+50)+"PE";
                instrumentList.push(CEname)
                instrumentList.push(PEname)
                instrumentList.push(CEname50)
                instrumentList.push(PEname50)
            }

            // Add BNF option details 
            for(let i=-15;i<=15;i++){
                var strike = (parseInt(bnfFUTprice/100) + i)*100;
                var CEname = "NFO:BANKNIFTY"+expiry.year+expiry.month+expiry.day+strike+"CE";
                var PEname = "NFO:BANKNIFTY"+expiry.year+expiry.month+expiry.day+strike+"PE";
                instrumentList.push(CEname)
                instrumentList.push(PEname)
            }     

            //logger.info(instrumentList);
            resolve( instrumentList );

        }catch(err){
            logger.error({"message" : "Unable to find indexOptionsToSubscribe " , err });
            reject(err);
        }
    })

    
}

//indexOptionsToSubscribe();

module.exports['getinstrumentsList'] = indexOptionsToSubscribe;