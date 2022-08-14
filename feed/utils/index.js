const params            = require("../models/params");
const instrumentID      = require("../data/instrumentID.js");
const fetch             = require("node-fetch");
const expiryUtil        = require("./expiry");
const logger            = require("pino")();

var daily = [ "00","01","02","03","04","05","06","07","08","09","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31"]
var weekly  = ["1","2","3","4","5","6","7","8","9","O","N","D"];
var monthly = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

function isEmptyDict(obj) {
    return Object.keys(obj).length === 0;
};

async function waitForXseconds(x){

    return new Promise((resolve,reject)=>{
        setTimeout(()=>{
            resolve("done");
        },x*1000);
    })
};

//------------------------------------------------------------------------------//

function getParams(){
    return new Promise( async (resolve,reject)=>{
        try{  
            let paramsObj = await params.findById("627b6b4eba0b94ea14f96932");

            let parsedObj = {
                userID  : paramsObj['userID'],
                password : paramsObj['password'],
                pin  : paramsObj['pin'],
                apikey   : paramsObj['apikey'],
                secret    : paramsObj['secret'],
                accesstoken : paramsObj['access_token'],
                auth_type : paramsObj['auth_type'],
                totp_secret : paramsObj['totp_secret']
            }

            resolve(parsedObj);  
            
            
        }catch(err){
            logger.info("Error while fetching Expiry Details through DB ",err);
            reject(err);
        }
    }) 

}
function getInstrumentID(instrument){

    return new Promise( async (resolve,reject)=>{
        try{  
            symb = instrument.split(":")[1];
            //logger.info(symb,instrumentID[symb]);
            resolve(instrumentID[symb]);        
        }catch(err){
            logger.info("Error while fetching InstrumentID  \n ",err);
            reject(err);
        }
    }); 
}

function findLTPthroughQuote(apiKey,accessToken,symbol){

    return new Promise(async (resolve, reject)=>{

        var url = "https://api.kite.trade/quote/ltp/?&i=" + symbol; //   &i=NFO:BANKNIFTY20DECFUT ;  add this to url for each instrument
        var options =  {
            method : 'GET',
            headers : {
            "Authorization": "token "+ apiKey + ":" + accessToken,
            "X-Kite-Version":3
            }
        }

        var res = await fetch(url ,options);
        var doc = await res.json();

        if( doc['status'] == 'success' && !isEmptyDict(doc['data']) ){
            var ltp = doc['data'][symbol]['last_price'];
            resolve(ltp);
        }else{
            logger.info("Error:2 => Rejecting in findLTPthroughQuote ");
            logger.error(doc);
            reject(doc) ;
        }

    })

}

function getTokenList(apiKey,accessToken,instrumentList){

    logger.info("Inside getTokenList() ");

    var fixedTokens = {
        "INDIA VIX"  : 264969 ,  
    }

    return new Promise(async (resolve,reject)=>{
     
      var url = "https://api.kite.trade/quote/?"; //   &i=NFO:NIFTY20D0312900CE ;  add this to url for each instrument
     
      instrumentList.forEach((instrument)=>{
          url += "&i="+ instrument;
      })
  
      var options =  {
          method : 'GET',
          headers : {
            "Authorization": "token "+ apiKey + ":" + accessToken,
            "X-Kite-Version":3
          }
        }
  
      var res = await fetch(url ,options);
  
      var doc = await res.json();

        if( doc['status'] == 'success'){

            var tokensList = {};
            
            instrumentList.forEach(instrument =>{
                if(instrument in doc['data']){
                var inst_token = doc['data'][instrument].instrument_token;
                tokensList[inst_token]  = instrument;
                }
            })

            // Add fixed Tokens to the list without exhange in font 
            Object.keys(fixedTokens).forEach( k =>{
                v = fixedTokens[k]
                tokensList[v]  = k;
            })
            
            resolve(tokensList);
        }else{
            logger.error("#1 : Error in fetching Quotes " , doc );
            reject("#11 Err in findQuote" );
        }
  
  
    })  
      
}

function checkToken(apiKey,accessToken){
    
    return new Promise(async (resolve, reject)=>{
        var url = "https://api.kite.trade/quote/?i=NSE:RELIANCE"; //   &i=NFO:NIFTY20D0312900CE ;  add this to url for each instrument
        var options =  {
            method : 'GET',
            headers : {
            "Authorization": "token "+ apiKey + ":" + accessToken,
            "X-Kite-Version":3
            }
        }

        try{
            var res = await fetch(url ,options);
            var doc = await res.json();
        }catch{
            reject(false);
        }
        
        if( doc['status'] == 'success'  ){
            //utils.print("Token Details are Valid !!");
            resolve(true);   
        }else{
            //utils.print("Token Details are InValid !!");
            resolve(false) ;
        }

    })
}

module.exports['isEmptyDict'] = isEmptyDict;
module.exports['waitForXseconds'] = waitForXseconds;
module.exports['getParams'] = getParams;
module.exports['getInstrumentID'] = getInstrumentID;
module.exports['getTokenList'] = getTokenList;
module.exports['checkToken'] = checkToken;
module.exports['findLTPthroughQuote'] = findLTPthroughQuote;