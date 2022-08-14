const mongoose = require("mongoose");
// const fu_nifty_1min = mongoose.model("fu_nifty_1min")
// const fu_nifty_5min = mongoose.model("fu_nifty_5min")
const cron = require("node-cron")
const getModel = require('../../models/createCandleModel')
// const getFut1MinPromise = new Promise((resolve, reject) => {
//     fu_nifty_1min.findOne({
//         minute: new Date(new Date().setHours(h, m, 0, 0))
//     }).then((data) => {
//         // console.log(data)
//         return data
//     })
// })
function candles(sym, name, token, timeframe) {
    // for (let h = 9; h < 16; h++) {
    //     for (let m = 0; m < 60; m++) {
    //         // if (h == 9 && m < 15)
    //             // if (h == 15 && m >= 30)
    //             console.log(h, m)
    //         getFut1MinData(h, m)
    //     }
    // }
    let min5Data = []
    cron.schedule(`0 */${timeframe} 9-15 * * 1-5`, async () => {
        console.log("cron running")
        let min1Candles = []
        let currentTime = new Date().getTime();
        console.log(currentTime)
        let minute = new Date(new Date().setSeconds(0, 0))

        let cacheData = {
            open: null,
            close: null,
            low: Infinity,
            high: 0,
            volume: null,
            oi: null,
        }

        for (let m = 0; m < timeframe; m++) {
            let model = `${sym}_${name}_1min`
            await getModel(model.toString()).findOne({
                minute: new Date(new Date(new Date().setMinutes(new Date().getMinutes() - m - 1, 0, 0)))
            }).then((data) => {
                min1Candles.push(data)
                console.log("data pushed")
            })
        }
        if (!cacheData.open) {
            for (let i = timeframe - 1; i >= 0; i--) {
                if (min1Candles[i]) {
                    cacheData.open = min1Candles[i].open
                    cacheData.volume = min1Candles[i].volume
                    break
                }
            }
        }
        if (!cacheData.close) {
            for (let i = 0; i < timeframe; i++) {
                if (min1Candles[i]) {
                    cacheData.close = min1Candles[i].close
                    cacheData.oi = min1Candles[i].oi
                    break
                }
            }
        }
        for (let i = timeframe - 1; i >= 0; i--) {
            if (min1Candles[i]) {
                cacheData.high = Math.max(cacheData.high, min1Candles[i].high)
                cacheData.low = Math.min(cacheData.low, min1Candles[i].low)
            }
        }
        console.log(cacheData)
        min5Data.push(min1Candles)
        console.log(min5Data)
        let model = `${sym}_${name}_${timeframe}min`
        getModel(model.toString()).findOneAndUpdate({
            instrument_token: token,
            minute: minute
        }, {
            instrument_token: token,
            minute: minute,
            open: cacheData.open,
            high: cacheData.high,
            low: cacheData.low,
            close: cacheData.close,
            volume: cacheData.volume,
            oi: cacheData.oi,
        }, {
            new: true,
            upsert: true
        }).then(data => {
            console.log("Last Input: in ", timeframe, " minute", data)
        })
    })

}
// candles_5min()
module.exports = candles