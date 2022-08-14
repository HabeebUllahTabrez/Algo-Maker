
const fyers   = require("fyers-api-v2");
const utils = require("../utils");
const logger    = require("pino")();
const expiryUtil        = require("../utils/expiry");

apiKey = "LSN3LBMU0W-100";
accessToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJhcGkuZnllcnMuaW4iLCJpYXQiOjE2MzA2NDMxODksImV4cCI6MTYzMDcxNTQyOSwibmJmIjoxNjMwNjQzMTg5LCJhdWQiOlsieDoyIiwiZDoyIiwiZDoxIiwieDoxIiwieDowIl0sInN1YiI6ImFjY2Vzc190b2tlbiIsImF0X2hhc2giOiJnQUFBQUFCaE1hUDFMQk5FRDBRMHhoX1EzcWp6THpPM25wNTlBajFEWk43SVVXc2w3TG9LNjlfaDM5M1VVV0IzWVoxZ0diNDZ3d3lyb2R2dS1nTUFaSkR4elNXZEQ4UlBkVTM5RjluNGkzRGR6V3pjU25PSHhQcz0iLCJkaXNwbGF5X25hbWUiOiJTQUdBUiBTSEFSTUEgVkFUUyIsImZ5X2lkIjoiWFMwNDA3OSIsImFwcFR5cGUiOjEwMCwicG9hX2ZsYWciOiJOIn0.ZYKDMz1GLCKss8TwNCgYxtBdJlVe8pxURsDOCyEZW_g";




var LTP   = {};
var VWAP  = {};
var VOL   = {};
var OI    = {};


function ltpQuoteFyers(apiKey,accessToken,instrument){

    return new Promise(async (resolve,reject)=>{

        fyers.setAppId(apiKey);
        fyers.setAccessToken(accessToken);
        

        if(instrument.split(":")[0] == "NSE"){
            instrument += "-EQ";
        }else if (instrument.split(":")[0] == "NFO"){
            instrument = "NSE:" + instrument.split(":")[1];
        }else{
            logger.error({ 'status' : "error" , message : " Invalid Instrument " + instrument });
            reject(instrument + " is not Valid !!");
        }
    
        try{
            let quotes = new fyers.quotes()
            let result = await quotes.setSymbol([instrument]).getQuotes();
            let ltp = result['d'][0]['v']['lp'];
            console.log(ltp);
            resolve(ltp);
        }catch(err){
            reject(err);
        }          

    });
}

const allFutures = [ "NFO:ALKEM","NFO:APLLTD","NFO:AUBANK","NFO:CUB","NFO:DEEPAKNTR"];
function findNamesToSubscribe(){

    // Find expiry details and make symbols to subscribe 
    // Find the pre market opening Price of NIF and BNF and find tokens for +-5 strikes above that 

    return new Promise( async (resolve,reject)=>{
        try{            

            // var params = await getParams();
            // var apiKey = params.apikey;
            // var accessToken = params.accesstoken;

            var instrumentList = ["NSE:RELIANCE-EQ"];

            expiry = await expiryUtil.getCurrentExpiryDetails();
            logger.info({ "Expiry Details " : expiry });

            niftyFUT = "NFO:NIFTY"+ expiry.year + expiry.futExpiryMonth + "FUT";
            bnfFUT = "NFO:BANKNIFTY"+ expiry.year + expiry.futExpiryMonth + "FUT";

            try{
                var niftyFUTprice = await ltpQuoteFyers(apiKey,accessToken,niftyFUT);
                var bnfFUTprice   = await ltpQuoteFyers(apiKey,accessToken,bnfFUT);
            }catch(err){
                logger.info("Error:1 => while finding FUT price ",err);
            }
            
            logger.info({ niftyFUT : niftyFUTprice, bnfFUT : bnfFUTprice });
          
           


            // Add FUT of NIFTY and BNF 
            instrumentList.push("NSE:NIFTY"+ expiry.year + expiry.nextFutExpiryMonth + "FUT");
            instrumentList.push("NSE:BANKNIFTY"+ expiry.year + expiry.nextFutExpiryMonth + "FUT");

            // allFutures.forEach(futSym =>{
            //     var futName = futSym + expiry.year + expiry.futExpiryMonth + "FUT";
            //     instrumentList.push(futName);
            // })
            
           

            // Add NIFTY option details 
            for(let i=-1;i<=1;i++){
                var strike   = (parseInt(niftyFUTprice/100) + i)*100;
                var CEname   = "NSE:NIFTY"+expiry.year+expiry.month+expiry.day+strike+"CE";
                var PEname   = "NSE:NIFTY"+expiry.year+expiry.month+expiry.day+strike+"PE";
                var CEname50 = "NSE:NIFTY"+expiry.year+expiry.month+expiry.day+JSON.stringify(strike+50)+"CE";
                var PEname50 = "NSE:NIFTY"+expiry.year+expiry.month+expiry.day+JSON.stringify(strike+50)+"PE";
                instrumentList.push(CEname)
                instrumentList.push(PEname)
                instrumentList.push(CEname50)
                instrumentList.push(PEname50)
            }

            // Add BNF option details 
            for(let i=-5;i<=5;i++){
                var strike = (parseInt(bnfFUTprice/100) + i)*100;
                var CEname = "NSE:BANKNIFTY"+expiry.year+expiry.month+expiry.day+strike+"CE";
                var PEname = "NSE:BANKNIFTY"+expiry.year+expiry.month+expiry.day+strike+"PE";
                instrumentList.push(CEname)
                instrumentList.push(PEname)
            }     

            //logger.info({"instrumentList" : instrumentList});
            resolve( instrumentList );

        }catch(err){
            logger.info("Rejecting From findNamesToSubscribe");
            reject(err);
        }
    })

    
}



async function subscribe(){


    
    let allInstruments = await findNamesToSubscribe();
    console.log(allInstruments);
    const reqBody = {
        symbol: allInstruments,
        dataType:'symbolUpdate'
    }
        
    fyers.fyers_connect(reqBody,function(data){
        let parsed =  JSON.parse(data);
       
        let ticks = parsed['d']['7208'];
        console.log(ticks);

        // ticks.forEach(tick=>{
        //     console.log(tick['v']['short_name'] , " => " , tick['v']['lp']);
        // })
    })
}
   
subscribe();
   
  
