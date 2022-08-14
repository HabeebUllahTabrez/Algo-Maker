const mongoose = require("mongoose");
const params = require("../models/params");
const fetch = require("node-fetch");
const instrumentID = require("../data/instrumentID.js");
const credentials = require("../data/credentials.json");
const zerodhaTrade = require('../broker/zerodha/trade');
const getModel = require('../models/getModel')
const futureTables = require("../models/futureTables");

const logger = require("pino")();
// const LIVEPRICES_URL = "http://localhost:4007"
const LIVEPRICES_URL = process.env.LIVEPRICES_URL
// const MISC_URL = "http://localhost:4008"
const MISC_URL = process.env.ORDER_URL

function print(msg1, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9, msg10, msg11) {
    var dt = new Date();
    var currTime = dt.toLocaleString("en-US");
    if (msg1 === undefined) {
        console.log(currTime);
    } else if (msg2 === undefined) {
        console.log(currTime, " ::  ", msg1);
    } else if (msg3 === undefined) {
        console.log(currTime, " ::  ", msg1, msg2);
    } else if (msg4 === undefined) {
        console.log(currTime, " ::  ", msg1, msg2, msg3);
    } else if (msg5 === undefined) {
        console.log(currTime, " ::  ", msg1, msg2, msg3, msg4);
    } else if (msg6 === undefined) {
        console.log(currTime, " ::  ", msg1, msg2, msg3, msg4, msg5);
    } else if (msg7 === undefined) {
        console.log(currTime, " ::  ", msg1, msg2, msg3, msg4, msg5, msg6);
    } else if (msg8 === undefined) {
        console.log(currTime, " ::  ", msg1, msg2, msg3, msg4, msg5, msg6, msg7);
    } else if (msg9 === undefined) {
        console.log(currTime, " ::  ", msg1, msg2, msg3, msg4, msg5, msg6, msg7, msg8);
    } else if (msg10 === undefined) {
        console.log(currTime, " ::  ", msg1, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9);
    } else if (msg11 === undefined) {
        console.log(currTime, " ::  ", msg1, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9, msg10);
    } else {
        console.log(currTime, " ::  ", msg1, msg2, msg3, msg4, msg5, msg6, msg7, msg8, msg9, msg10, msg11);
    }
};

function getParams() {
    return new Promise(async (resolve, reject) => {
        try {
            var paramsObj = await params.findOne({});
            resolve(paramsObj);
        } catch (err) {
            logger.info("Error while fetching Expiry Details through DB ", err);
            reject(err);
        }
    })

}


async function waitForXseconds(x) {

    return new Promise((resolve, reject) => {
        setTimeout(() => {
            resolve("done");
        }, x * 1000);
    })
};
function waitForTime(entryHour, entryMinute, entrySecond) {

    return new Promise(async (resolve, reject) => {

        while (1) {
            var dt = new Date();


            if (dt.getHours() > entryHour ||
                (dt.getHours() == entryHour && dt.getMinutes() > entryMinute) ||
                (dt.getHours() == entryHour && dt.getMinutes() >= entryMinute && dt.getSeconds() >= entrySecond)) {
                print({ message: " Strategy Start Time Reached ", time: dt.toLocaleTimeString() });
                resolve(true);
                break;
            } else {
                //print("waiting for " , 1000 - (new Date()).getMilliseconds()  );
                await waitForXseconds(1 - (new Date()).getMilliseconds() / 1000);
            }
        }
    });
}
//------------------------------------------------------------------------------//

function getLTP(instrument) {
    return new Promise(async (resolve, reject) => {
        let url = LIVEPRICES_URL + "/api/LTP?instrument=" + instrument;
        try {
            let res = await fetch(url);
            res = await res.json();
            if (res['status'] == 'success') {
                resolve(res['ltp']);
            } else {
                print("ERROR-log", res);
                reject(res);
            }
        } catch (err) {
            print("ERROR-log", err);
            reject(err);
        }
    })
}

function getInstrumentID(instrument) {

    return new Promise(async (resolve, reject) => {
        try {
            symb = instrument.split(":")[1];
            //logger.info(symb,instrumentID[symb]);
            resolve(instrumentID[symb]);
        } catch (err) {
            logger.info("Error while fetching InstrumentID  \n ", err);
            reject(err);
        }
    });
}

function getAllInstruments() {
    return new Promise(async (resolve, reject) => {
        try {
            symbols = Object.keys(instrumentID);
            // console.log(symbols);
            resolve(symbols);
        } catch (err) {
            print("ERROR-log", err);
            reject(err);
        }
    })
}

function getCandlesData(instrument, timeFrame, start, end) {
    return new Promise(async (resolve, reject) => {
        let ex = "fu"
        
        if (instrument.includes("BANKNIFTY")){
            instrument = "BANKNIFTY"
        } else {
            instrument = "NIFTY"
        }
        
        // if (instrument.slice(0, 3) == "NFO") ex = "op"
        // else ex = "fu"

        // access todays date
        const todaysDate = new Date();
        // set todays date to 12:00 midnight
        todaysDate.setHours(0, 0, 0, 0);

        await futureTables
            .find({ date: { $gt: todaysDate } })
            .sort("date")
            .then((dates) => {
                let fut_name = dates[0].name.toUpperCase();

                instrument = instrument + fut_name;
            });

        let model = `${ex}_${instrument.toLowerCase()}_${timeFrame}`
        // console.log(new Date(start))
        console.log("Table Name: ", model);
        getModel(model).find({
            minute: { $gte: new Date(start) },
            // minute: { $lte: new Date(end) }
        }).then((data) => {
            // console.log(data)
            resolve(data);
        }).catch((err) => {
            reject(err)
        })
        // let url = MISC_URL + "/api/getCandlesData?instrument=" + instrument + "&timeframe=" + timeFrame + "&from=" + start + "&to=" + end;

        // print({ "url": url });
        // try {
        //     let res = await fetch(url);
        //     res = await res.json();
        //     // print(res);
        //     if (res['status'] == "success") {
        //         // last element is the latest candle 
        //         resolve(res['data']);
        //     } else {
        //         reject(res);
        //     }
        // } catch (err) {
        //     reject(err);
        // }
    })
}

function getTodaysCandle(instrument, timeFrame) {
    return new Promise(async (resolve, reject) => {
        let interval
        // console.log(instrument, timeFrame)
        if (timeFrame == "1") interval = "1min"
        else interval = timeFrame + "minute"
        let today = new Date();
        let start = today.setHours(0, 0, 0, 0)
        let dateFormat = today.getFullYear().toString() + "-" + (today.getMonth() + 1).toString() + "-" + today.getDate().toString();

        // let url = MISC_URL + "/api/getCandlesData?instrument=" + instrument + "&timeframe=" + interval + "&from=" + dateFormat + "&to=" + dateFormat;
        // // print({ "url": url });
        // try {
        //     let res = await fetch(url);
        //     res = await res.json();
        //     // print(res);
        //     if (res['status'] == "success") {
        //         // last element is the latest candle 
        //         resolve(res['data']);
        //     } else {
        //         reject(res);
        //     }
        // } catch (err) {
        //     reject(err);
        // }

        let ex = "fu"
        // if (instrument.slice(0, 3) == "NFO") ex = "op"
        // else ex = "fu"
        let model = `${ex}_${instrument.toLowerCase()}_${interval}`
        // console.log(new Date(start))
        // console.log("Model Name: ", model)
        getModel(model).find({
            minute: { $gte: new Date(start) },
            // minute: { $lte: new Date(end) }
        }).then((data) => {
            // console.log(data)
            resolve(data);
        }).catch((err) => {
            reject(err)
        })
    })
}

function getClientPositions(apiKey, accessToken) {
    return new Promise(async (resolve, reject) => {
        try {
            let url = MISC_URL + "/api/getClientPositions";
            let details = {
                "apiKey": apiKey,
                "accessToken": accessToken
            }
            let positions = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(details)
            });
            if (positions) {
                resolve(positions);
            }
            else {
                reject({ message: "Positions not found" });
            }
        } catch (err) {
            print("ERROR-log", err);
            reject(err);
        }
    })
}

async function placeTrade({ account, userID, apiKey, accessToken, instrument, t_type, qty, order_type, product, price, trigger_price }) {

    let url = MISC_URL + "/api/placeTrade"
    trade = {
        "account": account,
        "userID": userID,
        "apiKey": apiKey,
        "accessToken": accessToken,
        "t_type": t_type,
        "instrument": instrument,
        "qty": qty,
        "product": product,
        "order_type": order_type,
        "price": price,
        "trigger_price": trigger_price

    }
    console.log(trade["instrument"]);
    try {
        let res = await fetch(url, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(trade)
        });
        res = await res.json();

        if (res['status'] == 'success') {
            print({ "userId": userID, res });
        } else {
            print("ERROR-log", { "userId": userID, "response": res.message });
        }

    } catch (err) {
        print("ERROR-log", err);
        reject(err);
    }

}

async function login({ userID, apiKey, pin, password, auth_type, secret, totp_secret }) {

    let url = MISC_URL + "/api/zerodha/login"

    user = {
        "userID": userID,
        "apiKey": apiKey,
        "pin": pin,
        "password": password,
        "auth_type": auth_type,
        "secret": secret,
        "totp_secret": totp_secret
    }


    try {
        let res = await fetch(url, {
            method: "POST",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });
        res = await res.json();

        if (res['status'] == 'success') {
            resolve(res["data"]);
        } else {
            print("ERROR-log", { "userId": userID, "response": res.message });
        }

    } catch (err) {
        print("ERROR-log", err);
        reject(err);
    }

}


module.exports["login"] = login;
module.exports["placeTrade"] = placeTrade;
module.exports["getInstrumentID"] = getInstrumentID;
module.exports["getClientPositions"] = getClientPositions;
module.exports["getCandlesData"] = getCandlesData;
module.exports["getTodaysCandle"] = getTodaysCandle;
module.exports['print'] = print;

module.exports['waitForXseconds'] = waitForXseconds;

module.exports['waitForTime'] = waitForTime;
module.exports['getLTP'] = getLTP;
module.exports['getAllInstruments'] = getAllInstruments;