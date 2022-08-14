const params            = require("../models/params");
const instrumentID      = require("../data/instrumentID.js");
const fetch             = require("node-fetch");
const expiryUtil        = require("./expiry");
const logger            = require("pino")();
const utils             = require("./index");
const futures           = require("../data/futures");

var daily = [ "00","01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31"]
var weekly  = ["1","2","3","4","5","6","7","8","9","O","N","D"];
var monthly = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

function futuresToSubscribe(){

    // Find expiry details and make symbols to subscribe 
    // Find the pre market opening Price of NIF and BNF and find tokens for +-5 strikes above that 

    return new Promise( async (resolve,reject)=>{
        try{            

            var params      = await utils.getParams();
            var apiKey      = params.apikey;
            var accessToken = params.accesstoken;

            var instrumentList = ["NSE:RELIANCE" ];

            expiry = await expiryUtil.getCurrentExpiryDetails();
            logger.info( { "expiry" : expiry });
          
            niftyFUT = "NFO:NIFTY"+ expiry.year + expiry.futExpiryMonth + "FUT";
            bnfFUT = "NFO:BANKNIFTY"+ expiry.year + expiry.futExpiryMonth + "FUT";

            // Add FUT of NIFTY and BNF 
            instrumentList.push(niftyFUT);
            instrumentList.push(bnfFUT);
            instrumentList.push("NFO:NIFTY"+ expiry.year + expiry.nextFutExpiryMonth + "FUT");
            instrumentList.push("NFO:BANKNIFTY"+ expiry.year + expiry.nextFutExpiryMonth + "FUT");

            futures.forEach(futSym =>{
                var currMonthFutName =  "NFO:" + futSym + expiry.year + expiry.futExpiryMonth + "FUT";
                var nextMonthFutName =  "NFO:" + futSym + expiry.year + expiry.nextFutExpiryMonth + "FUT";
                instrumentList.push(currMonthFutName);
                instrumentList.push(nextMonthFutName);
            })

            //logger.info(instrumentList);
            resolve( instrumentList );

        }catch(err){
            logger.error({"message" : "Unable to find futuresToSubscribe " , err });
            reject(err);
        }
    })

    
}

//futuresToSubscribe();

module.exports['getinstrumentsList'] = futuresToSubscribe;