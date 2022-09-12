const SMA = require("technicalindicators").SMA;
const VWAP = require("technicalindicators").VWAP;
const RSI = require("technicalindicators").RSI;
const MACD = require("technicalindicators").MACD;
const ADX = require('technicalindicators').ADX;
const ATR = require('technicalindicators').ATR;
const CCI = require('technicalindicators').CCI;
const PSAR = require('technicalindicators').PSAR;
const ROC = require('technicalindicators').ROC;
const WMA = require('technicalindicators').WMA;
const Stochastic = require('technicalindicators').Stochastic;
const WilliamsR = require('technicalindicators').WilliamsR;
const zerodhaTrade = require("../../broker/zerodha/trade");
const utils = require("../../utils");
const logger = require("pino")();

const Stock = require("stock-technical-indicators");
const Indicator = Stock.Indicator;
const { Supertrend } = require("stock-technical-indicators/study/Supertrend");
const newStudyATR = new Indicator(new Supertrend());
const { ChandeMO } = require("bfx-hf-indicators");
const { EMA } = require("bfx-hf-indicators");
const { CG } = require("trading-signals");

function normalize(val, max, min) {
  return (val - min) / (max - min);
}

function getTimeFrameStringToNum(timeFrame) {
  let interval;
  let x = 5;
  if (timeFrame === "30" || timeFrame === "60") x = 10;
  if (timeFrame == "1") interval = "1min";
  else interval = timeFrame + "min";
  return {
    interval,
    x
  }
}


function getTimes(x) {
  let end = new Date();
  let start = new Date(end.getTime() - x * 24 * 60 * 60 * 1000);
  return {end , start};
}


//  Simple Moving Average (SMA). 
async function sma({ dataSymmbolModel, timeFrame, period, candleParam }) {
  return new Promise(async (resolve, reject) => {
    try {

      let data, candleIndex;
      const {x , interval} = getTimeFrameStringToNum(timeFrame);
      // console.log("In sma: ", x, interval)
      
     const {end , start} = getTimes(x);
       
      if (candleParam === "open") {
        candleIndex = 1;
      } else if (candleParam === "high") {
        candleIndex = 2;
      } else if (candleParam === "low") {
        candleIndex = 3;
      } else if (candleParam === "close") {
        candleIndex = 4;
      }

      // console.log(start)
      // console.log(end)
      try {
        data = await utils.getCandlesData(dataSymmbolModel, interval, start, end);
      } catch (err) {
        reject(err);
      }

      // console.log("candle", data[0])
      let sma = SMA.calculate({
        period: period,
        values: data.map((x) => x[candleParam]),
      });
      // console.log(sma)
      resolve(sma[sma.length - 1]);
    } catch (err) {
      reject(err);
    }
  });
}

async function vwap({  dataSymmbolModel, timeFrame, period, candleParam }) {
  return new Promise(async (resolve, reject) => {
    try {
      let data, candleIndex;

      const {x , interval} = getTimeFrameStringToNum(timeFrame);
      const {end , start} = getTimes(x);

      try {
        data = await utils.getCandlesData(dataSymmbolModel, interval, start, end);
      } catch (err) {
        console.log(err);
        reject(err);
      }

      // This function requires volume

      console.log("candle", data[0]);
      let vwap = VWAP.calculate({
        period: period,
        // values: data.map(x => x[candleParam]),
        high: data.map((x) => x["high"]),
        low: data.map((x) => x["low"]),
        close: data.map((x) => x["close"]),
        volume: data.map((x) => x["volume"]),
      });

      console.log(vwap);
      resolve(vwap[vwap.length - 1]);
    } catch (err) {
      reject(err);
    }
  });
}

async function superTrend({
  dataSymmbolModel,
  timeFrame,
  period,
  multiplier,
  candleParam,
}) {
  return new Promise(async (resolve, reject) => {
    try {
     
      let data, candleIndex;
      const {x , interval} = getTimeFrameStringToNum(timeFrame);
      const {end , start} = getTimes(x);

      try {
        data = await utils.getCandlesData(dataSymmbolModel, interval, start, end);
      } catch (err) {
        console.log(err);
        reject(err);
      }

      // This function requires volume

      let candleST = newStudyATR.calculate(data, {
        period: period,
        multiplier: multiplier,
      });

      // console.log(candleST)
      if (candleST.length > 1) {
        let latestCandle = candleST[candleST.length - 1];
        logger.info(latestCandle);

        let finalData = {
          time: latestCandle[0],
          model: dataSymmbolModel,
          open: latestCandle[1],
          high: latestCandle[2],
          low: latestCandle[3],
          close: latestCandle[4],
          direction: latestCandle["Supertrend"]["Direction"],
          up: parseFloat(latestCandle["Supertrend"]["Up"].toFixed(2)),
          down: parseFloat(latestCandle["Supertrend"]["Down"].toFixed(2)),
          active: parseFloat(
            latestCandle["Supertrend"]["ActiveTrend"].toFixed(2)
          ),
        };

        // logger.info({ "reponse": finalData });
        resolve(finalData["active"]);
      } else {
        reject("Couldn't find candles data to compute Supertrend ");
      }
    } catch (err) {
      reject(err);
    }
  });
}

async function chandeMomentum({ dataSymmbolModel, timeFrame, period, candleParam }) {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("In chande momentum!");
     
      let data, candleIndex;
      // console.log(model, timeFrame, period, candleParam)
      const {x , interval} = getTimeFrameStringToNum(timeFrame);
      const {end , start} = getTimes(x);

      if (candleParam === "open") {
        candleIndex = 1;
      } else if (candleParam === "high") {
        candleIndex = 2;
      } else if (candleParam === "low") {
        candleIndex = 3;
      } else if (candleParam === "close") {
        candleIndex = 4;
      }

      // console.log(start)
      // console.log(end)
      try {
        data = await utils.getCandlesData(dataSymmbolModel, interval, start, end);
      } catch (err) {
        console.log(err);
        reject(err);
      }

      // console.log("candle", data[0])
      const cmo = new ChandeMO([period]);
      cmo._dataKey = candleParam;
      // console.log(ChandeMO,'object; ' , cmo)

      for (let i = 0; i < period; i++) {
        // console.log(data[data.length - i - 1][candleParam])
        cmo.add(data[data.length - i - 1]);
        // console.log(cmo)
      }

      // console.log('cmov',cmo.v(), cmo.l())
      resolve(cmo.v());
    } catch (err) {
      reject(err);
    }
  });
}

async function centerOfGravity({ dataSymmbolModel, timeFrame, period, candleParam }) {
  return new Promise(async (resolve, reject) => {
    try {
     
      let  data, candleIndex;
      console.log("In center of gravity");

      const {x , interval} = getTimeFrameStringToNum(timeFrame);
      const {end , start} = getTimes(x);

      if (candleParam === "open") {
        candleIndex = 1;
      } else if (candleParam === "high") {
        candleIndex = 2;
      } else if (candleParam === "low") {
        candleIndex = 3;
      } else if (candleParam === "close") {
        candleIndex = 4;
      }

      console.log(start);
      console.log(end);
      try {
        data = await utils.getCandlesData(dataSymmbolModel, interval, start, end);
      } catch (err) {
        console.log(err);
        reject(err);
      }

      console.log("candle", data[0]);
      const cg = new CG(interval, period);

      for (let i = 0; i < period; i++) {
        // console.log(data[data.length - i - 1][candleParam])
        cg.update(data[data.length - i - 1][candleParam]);
        // console.log(cg)
      }

      // console.log("Final Value: ", +cg.getResult().valueOf())

      resolve(+cg.getResult().valueOf());
    } catch (err) {
      reject(err);
    }
  });
}

async function fisherTransform({ dataSymmbolModel, timeFrame, period, candleParam }) {
  return new Promise(async (resolve, reject) => {
    try {
     
      let  data, candleIndex;
      // console.log(model, timeFrame, period, candleParam)

      const {x , interval} = getTimeFrameStringToNum(timeFrame);
      const {end , start} = getTimes(x);

      if (candleParam === "open") {
        candleIndex = 1;
      } else if (candleParam === "high") {
        candleIndex = 2;
      } else if (candleParam === "low") {
        candleIndex = 3;
      } else if (candleParam === "close") {
        candleIndex = 4;
      }

      console.log(start);
      console.log(end);
      try {
        data = await utils.getCandlesData(dataSymmbolModel, interval, start, end);
      } catch (err) {
        console.log(err);
        reject(err);
      }

      let nRecentValues = data.slice(-period);

      let max = Math.max(...nRecentValues.map((o) => o[candleParam]));
      let min = Math.min(...nRecentValues.map((o) => o[candleParam]));

      // for (let i = 0; i < period; i++) {
      //     // console.log(data[data.length - i - 1][candleParam])
      //     let normalizedValue = normalize(nRecentValues[nRecentValues.length - i - 1][candleParam], max, min)
      //     cmo.add(data[data.length - i - 1]);
      // }

      let normalizedValue = normalize(
        nRecentValues[nRecentValues.length - 1][candleParam],
        max,
        min
      );

      let fishTransform =
        (1 / 2) * Math.log((1 + normalizedValue) / (1 - normalizedValue));

      // console.log(fishTransform)
      resolve(fishTransform);
    } catch (err) {
      reject(err);
    }
  });
}

// Relative Strength Index (RSI).
async function rsi({ dataSymmbolModel, timeFrame, period, candleParam }) {
  return new Promise(async (resolve, reject) => {
    try {

      let data, candleIndex;
      // console.log(model, timeFrame, period, candleParam)

      const {x , interval} = getTimeFrameStringToNum(timeFrame);
      const {end , start} = getTimes(x);

      if (candleParam === "open") {
        candleIndex = 1;
      } else if (candleParam === "high") {
        candleIndex = 2;
      } else if (candleParam === "low") {
        candleIndex = 3;
      } else if (candleParam === "close") {
        candleIndex = 4;
      }

      console.log(start);
      console.log(end);
      try {
        data = await utils.getCandlesData(dataSymmbolModel, interval, start, end);
      } catch (err) {
        console.log(err);
        reject(err);
      }

      // console.log("candle", data[0])
      let rsi = RSI.calculate({
        period: period,
        values: data.map((x) => x[candleParam]),
      });
      // console.log(rsi)
      resolve(rsi[rsi.length - 1]);
    } catch (err) {
      reject(err);
    }
  });
}

// Moving Average Convergence Divergence (MACD).
async function macd({ dataSymmbolModel, timeFrame, period, candleParam }) {
  return new Promise(async (resolve, reject) => {
    try {
     
      let data, candleIndex;
      // console.log(model, timeFrame, period, candleParam)

      const {x , interval} = getTimeFrameStringToNum(timeFrame);
      const {end , start} = getTimes(x);

      if (candleParam === "open") {
        candleIndex = 1;
      } else if (candleParam === "high") {
        candleIndex = 2;
      } else if (candleParam === "low") {
        candleIndex = 3;
      } else if (candleParam === "close") {
        candleIndex = 4;
      }

      console.log(start);
      console.log(end);
      try {
        data = await utils.getCandlesData(dataSymmbolModel, interval, start, end);
      } catch (err) {
        console.log(err);
        reject(err);
      }

      // console.log("candle", data[0])
      let macd = MACD.calculate({
        fastPeriod: 12,
        slowPeriod: 26,
        signalPeriod: 9,
        values: data.map((x) => x[candleParam]),
        SimpleMAOscillator: false,
        SimpleMASignal: false,
      });

      console.log(macd);
      resolve(macd[macd.length - 1]);
    } catch (err) {
      reject(err);
    }
  });
}

// Exponential Moving Average (EMA).
async function ema({ dataSymmbolModel, timeFrame, period, candleParam }) {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("In EMA");
      let data, candleIndex;
      // console.log(model, timeFrame, period, candleParam)
      const {x , interval} = getTimeFrameStringToNum(timeFrame);
      const {end , start} = getTimes(x);

      if (candleParam === "open") {
        candleIndex = 1;
      } else if (candleParam === "high") {
        candleIndex = 2;
      } else if (candleParam === "low") {
        candleIndex = 3;
      } else if (candleParam === "close") {
        candleIndex = 4;
      }

      // console.log(start)
      // console.log(end)
      try {
        data = await utils.getCandlesData(dataSymmbolModel, interval, start, end);
      } catch (err) {
        console.log(err);
        reject(err);
      }

      // console.log("candle", data[0])
      const ema = new EMA([period]);

      // ema._dataKey = candleParam;
      // console.log("EMA object: " , ema)

      for (let i = 0; i < period; i++) {
        // console.log(data[data.length - i - 1][candleParam])
        ema.add(data[data.length - i - 1][candleParam]);
        // console.log(ema)
      }

      resolve(ema.v());
    } catch (err) {
      reject(err);
    }
  });
}

// Average True Range (ATR).
async function atr({ dataSymmbolModel, timeFrame, period, candleParam }) {
  return new Promise(async (resolve, reject) => {
    try {
      
      let data, candleIndex;
      const {x , interval} = getTimeFrameStringToNum(timeFrame);
      const {end , start} = getTimes(x);

      try {
        data = await utils.getCandlesData(dataSymmbolModel, interval, start, end);
      } catch (err) {
        console.log(err);
        reject(err);
      }

      // This function requires volume

      console.log("atr candle", data[0]);
      let input = {
        // values: data.map(x => x[candleParam]),
        high: data.map((x) => x["high"]),
        low: data.map((x) => x["low"]),
        close: data.map((x) => x[candleParam]),
        period: period,
      }
      let atr = ATR.calculate(input);

      // console.log(atr);
      resolve(atr[atr.length - 1]);
    } catch (err) {
      reject(err);
    }
  });
}

// Average Directional Index (ADX).
async function adx({ dataSymmbolModel, timeFrame, period, candleParam }) {
  return new Promise(async (resolve, reject) => {
    try {
      
      let data, candleIndex;
      const {x , interval} = getTimeFrameStringToNum(timeFrame);
      const {end , start} = getTimes(x);
      console.log("Adx" , dataSymmbolModel , timeFrame , period , end , start);
      try {
        data = await utils.getCandlesData(dataSymmbolModel, interval, start, end);
      } catch (err) {
        console.log(err);
        reject(err);
      }
      
      console.log("candle", data[0]);
  
      let adx = ADX.calculate({
        // values: data.map(x => x[candleParam]),
        close: data.map((x) => x["close"]),
        high: data.map((x) => x["high"]),
        low: data.map((x) => x["low"]),
        period: period,
      });

      // console.log(adx);
      resolve(adx[adx.length - 1]);
    } catch (err) {
      reject(err);
    }
  });
}


async function cci({ dataSymmbolModel, timeFrame, period, candleParam }) {
  return new Promise(async (resolve, reject) => {
    try {
      
      let data, candleIndex;
      const {x , interval} = getTimeFrameStringToNum(timeFrame);
      const {end , start} = getTimes(x);

      try {
        data = await utils.getCandlesData(dataSymmbolModel, interval, start, end);
      } catch (err) {
        console.log(err);
        reject(err);
      }

  
      console.log("candle", data[0]);
      let adx = CCI.calculate({
        // values: data.map(x => x[candleParam]),
        open : data.map(x =>x["open"]),
        high: data.map((x) => x["high"]),
        low: data.map((x) => x["low"]),
        close: data.map((x) => x[candleParam]),
        period: period,
      });

      console.log(adx);
      resolve(adx[adx.length - 1]);
    } catch (err) {
      reject(err);
    }
  });
}

// Parabolic Stop and Reverse (PSAR)
async function psar({ dataSymmbolModel, timeFrame, period, candleParam }) {
  return new Promise(async (resolve, reject) => {
    try {
      
      let data, candleIndex;

      const {x , interval} = getTimeFrameStringToNum(timeFrame);
      const {end , start} = getTimes(x);

      try {
        data = await utils.getCandlesData(dataSymmbolModel, interval, start, end);
      } catch (err) {
        console.log(err);
        reject(err);
      }

      // This function requires volume
      console.log("Parabolic Stop and Reverse candle", data[0]);
      let psar = PSAR.calculate({
        // values: data.map(x => x[candleParam]),
        high: data.map((x) => x["high"]),
        low: data.map((x) => x["low"]),
        step : 0.02,
        max : 0.2
      });

      console.log(psar);
      resolve(psar[psar.length - 1]);
    } catch (err) {
      reject(err);
    }
  });
}

// Rate of Change*
async function Roc({ dataSymmbolModel, timeFrame, period, candleParam }) {
  return new Promise(async (resolve, reject) => {

    let data, candleIndex;
    const {x , interval} = getTimeFrameStringToNum(timeFrame);
    const {end , start} = getTimes(x);

    try {
      data = await utils.getCandlesData(dataSymmbolModel, interval, start, end);
      console.log("candle", data[0]);  // print data cmd

      var input = {period : period , values : data.map((x) => x[candleParam])}
      let roc = ROC.calculate(input);    

      console.log(roc);
      resolve(roc[roc.length - 1]);    
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
}


// Stochastic Oscillator (KD).
async function stochastic({ dataSymmbolModel, timeFrame, period, candleParam }) {
  return new Promise(async (resolve, reject) => {

    let data, candleIndex;
    const {x , interval} = getTimeFrameStringToNum(timeFrame);
    const {end , start} = getTimes(x);

    try {
      data = await utils.getCandlesData(dataSymmbolModel, interval, start, end);
      console.log("candle", data[0]);  // print data cmd

      let kd = Stochastic.calculate({
        high: data.map((x) => x["high"]),
        low: data.map((x) => x["low"]),
        close: data.map((x) => x["close"]),
        period : period,
        signalPeriod : 3
      });    

      console.log(kd);
      resolve(kd[kd.length - 1]);    
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
}


// weigheted moving average
async function wma({ dataSymmbolModel, timeFrame, period, candleParam }) {
  return new Promise(async (resolve, reject) => {

    let data, candleIndex;
    const {x , interval} = getTimeFrameStringToNum(timeFrame);
    const {end , start} = getTimes(x);

    try {
      data = await utils.getCandlesData(dataSymmbolModel, interval, start, end);
      console.log("candle", data[0]);  // print data cmd

      var input = {period : period , values : data.map((x) => x[candleParam])}
      let wma = WMA.calculate(input);    

      console.log(wma);
      resolve(wma[wma.length - 1]);    
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
}

// WilliamsR (WilliamsR)
async function williamsR({ dataSymmbolModel, timeFrame, period, candleParam }) {
  return new Promise(async (resolve, reject) => {
    try {
      
      let data, candleIndex;
      const {x , interval} = getTimeFrameStringToNum(timeFrame);
      const {end , start} = getTimes(x);

      try {
        data = await utils.getCandlesData(dataSymmbolModel, interval, start, end);
      } catch (err) {
        console.log(err);
        reject(err);
      }

      // This function requires volume
      console.log("WilliamsR candle", data[0]);
      let input = {
        // values: data.map(x => x[candleParam]),
        high: data.map((x) => x["high"]),
        low: data.map((x) => x["low"]),
        close: data.map((x) => x["close"]),
        period: period,
      }
      let williamsR = WilliamsR.calculate(input);
      
      console.log(williamsR);
      resolve(williamsR[williamsR.length - 1]);
    } catch (err) {
      reject(err);
    }
  });
}


module.exports["superTrend"] = superTrend;
module.exports["sma"] = sma;
module.exports["vwap"] = vwap;
module.exports["cmo"] = chandeMomentum;
module.exports["cog"] = centerOfGravity;
module.exports["ft"] = fisherTransform;
module.exports["rsi"] = rsi;
module.exports["macd"] = macd;
module.exports["ema"] = ema;
module.exports["atr"] = atr;
module.exports["adx"] = adx;
module.exports["cci"] = cci; 
module.exports["psar"] = psar; 
module.exports["Roc"] = Roc; 
module.exports["wma"] = wma; 
module.exports["stochastic"] = stochastic; 
module.exports["williamsR"] = williamsR; 