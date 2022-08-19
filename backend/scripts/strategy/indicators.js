const SMA = require("technicalindicators").SMA;
const VWAP = require("technicalindicators").VWAP;
const RSI = require("technicalindicators").RSI;
const MACD = require("technicalindicators").MACD;
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

async function sma({ instrument, timeFrame, period, candleParam }) {
  return new Promise(async (resolve, reject) => {
    try {
      let x = 5;
      let interval, data, candleIndex;
      // console.log(instrument, timeFrame, period, candleParam)

      if (timeFrame === "30" || timeFrame === "60") x = 10;
      if (timeFrame == "1") interval = "1min";
      else interval = timeFrame + "min";
      let end = new Date();

      if (candleParam === "open") {
        candleIndex = 1;
      } else if (candleParam === "high") {
        candleIndex = 2;
      } else if (candleParam === "low") {
        candleIndex = 3;
      } else if (candleParam === "close") {
        candleIndex = 4;
      }

      let start = new Date(end.getTime() - x * 24 * 60 * 60 * 1000);
      // console.log(start)
      // console.log(end)
      try {
        data = await utils.getCandlesData(instrument, interval, start, end);
      } catch (err) {
        console.log(err);
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

async function vwap({ instrument, timeFrame, period, candleParam }) {
  return new Promise(async (resolve, reject) => {
    try {
      let x = 5;
      let interval, data, candleIndex;

      if (timeFrame === "30" || timeFrame === "60") x = 10;
      if (timeFrame == "1") interval = "1min";
      else interval = timeFrame + "min";
      let end = new Date();

      let start = new Date(end.getTime() - x * 24 * 60 * 60 * 1000);
      try {
        data = await utils.getCandlesData(instrument, interval, start, end);
      } catch (err) {
        console.log(err);
        reject(err);
      }

      // This function requires volume

      console.log("candle", data[0]);
      let vwap = VWAP.calculate({
        period: period,
        // values: data.map(x => x[candleParam]),
        high: data.map((x) => x[2]),
        low: data.map((x) => x[3]),
        close: data.map((x) => x[4]),
        volume: data.map((x) => x[5]),
      });

      console.log(vwap);
      resolve(vwap[vwap.length - 1]);
    } catch (err) {
      reject(err);
    }
  });
}

async function superTrend({
  instrument,
  timeFrame,
  period,
  multiplier,
  candleParam,
}) {
  return new Promise(async (resolve, reject) => {
    try {
      let x = 5;
      let interval, data, candleIndex;

      if (timeFrame === "30" || timeFrame === "60") x = 10;
      if (timeFrame == "1") interval = "1min";
      else interval = timeFrame + "min";
      let end = new Date();

      let start = new Date(end.getTime() - x * 24 * 60 * 60 * 1000);
      try {
        data = await utils.getCandlesData(instrument, interval, start, end);
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
          instrument: instrument,
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

async function chandeMomentum({ instrument, timeFrame, period, candleParam }) {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("In chande momentum!");
      let x = 5;
      let interval, data, candleIndex;
      // console.log(instrument, timeFrame, period, candleParam)

      if (timeFrame === "30" || timeFrame === "60") x = 10;
      if (timeFrame == "1") interval = "1min";
      else interval = timeFrame + "min";
      let end = new Date();

      if (candleParam === "open") {
        candleIndex = 1;
      } else if (candleParam === "high") {
        candleIndex = 2;
      } else if (candleParam === "low") {
        candleIndex = 3;
      } else if (candleParam === "close") {
        candleIndex = 4;
      }

      let start = new Date(end.getTime() - x * 24 * 60 * 60 * 1000);
      // console.log(start)
      // console.log(end)
      try {
        data = await utils.getCandlesData(instrument, interval, start, end);
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

async function centerOfGravity({ instrument, timeFrame, period, candleParam }) {
  return new Promise(async (resolve, reject) => {
    try {
      let x = 5;
      let interval, data, candleIndex;
      console.log("In center of gravity");

      if (timeFrame === "30" || timeFrame === "60") x = 10;
      if (timeFrame == "1") interval = "1min";
      else interval = timeFrame + "min";
      let end = new Date();

      if (candleParam === "open") {
        candleIndex = 1;
      } else if (candleParam === "high") {
        candleIndex = 2;
      } else if (candleParam === "low") {
        candleIndex = 3;
      } else if (candleParam === "close") {
        candleIndex = 4;
      }

      let start = new Date(end.getTime() - x * 24 * 60 * 60 * 1000);
      console.log(start);
      console.log(end);
      try {
        data = await utils.getCandlesData(instrument, interval, start, end);
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

async function fisherTransform({ instrument, timeFrame, period, candleParam }) {
  return new Promise(async (resolve, reject) => {
    try {
      let x = 5;
      let interval, data, candleIndex;
      // console.log(instrument, timeFrame, period, candleParam)

      if (timeFrame === "30" || timeFrame === "60") x = 10;
      if (timeFrame == "1") interval = "1min";
      else interval = timeFrame + "min";
      let end = new Date();

      if (candleParam === "open") {
        candleIndex = 1;
      } else if (candleParam === "high") {
        candleIndex = 2;
      } else if (candleParam === "low") {
        candleIndex = 3;
      } else if (candleParam === "close") {
        candleIndex = 4;
      }

      let start = new Date(end.getTime() - x * 24 * 60 * 60 * 1000);
      console.log(start);
      console.log(end);
      try {
        data = await utils.getCandlesData(instrument, interval, start, end);
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

async function rsi({ instrument, timeFrame, period, candleParam }) {
  return new Promise(async (resolve, reject) => {
    try {
      let x = 5;
      let interval, data, candleIndex;
      // console.log(instrument, timeFrame, period, candleParam)

      if (timeFrame === "30" || timeFrame === "60") x = 10;
      if (timeFrame == "1") interval = "1min";
      else interval = timeFrame + "min";
      let end = new Date();

      if (candleParam === "open") {
        candleIndex = 1;
      } else if (candleParam === "high") {
        candleIndex = 2;
      } else if (candleParam === "low") {
        candleIndex = 3;
      } else if (candleParam === "close") {
        candleIndex = 4;
      }

      let start = new Date(end.getTime() - x * 24 * 60 * 60 * 1000);
      console.log(start);
      console.log(end);
      try {
        data = await utils.getCandlesData(instrument, interval, start, end);
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

async function macd({ instrument, timeFrame, period, candleParam }) {
  return new Promise(async (resolve, reject) => {
    try {
      let x = 5;
      let interval, data, candleIndex;
      // console.log(instrument, timeFrame, period, candleParam)

      if (timeFrame === "30" || timeFrame === "60") x = 10;
      if (timeFrame == "1") interval = "1min";
      else interval = timeFrame + "min";
      let end = new Date();

      if (candleParam === "open") {
        candleIndex = 1;
      } else if (candleParam === "high") {
        candleIndex = 2;
      } else if (candleParam === "low") {
        candleIndex = 3;
      } else if (candleParam === "close") {
        candleIndex = 4;
      }

      let start = new Date(end.getTime() - x * 24 * 60 * 60 * 1000);
      console.log(start);
      console.log(end);
      try {
        data = await utils.getCandlesData(instrument, interval, start, end);
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

async function ema({ instrument, timeFrame, period, candleParam }) {
  return new Promise(async (resolve, reject) => {
    try {
      console.log("In EMA");
      let x = 5;
      let interval, data, candleIndex;
      // console.log(instrument, timeFrame, period, candleParam)

      if (timeFrame === "30" || timeFrame === "60") x = 10;
      if (timeFrame == "1") interval = "1min";
      else interval = timeFrame + "min";
      let end = new Date();

      if (candleParam === "open") {
        candleIndex = 1;
      } else if (candleParam === "high") {
        candleIndex = 2;
      } else if (candleParam === "low") {
        candleIndex = 3;
      } else if (candleParam === "close") {
        candleIndex = 4;
      }

      let start = new Date(end.getTime() - x * 24 * 60 * 60 * 1000);
      // console.log(start)
      // console.log(end)
      try {
        data = await utils.getCandlesData(instrument, interval, start, end);
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

module.exports["superTrend"] = superTrend;
module.exports["sma"] = sma;
module.exports["vwap"] = vwap;
module.exports["cmo"] = chandeMomentum;
module.exports["cog"] = centerOfGravity;
module.exports["ft"] = fisherTransform;
module.exports["rsi"] = rsi;
module.exports["macd"] = macd;
module.exports["ema"] = ema;
