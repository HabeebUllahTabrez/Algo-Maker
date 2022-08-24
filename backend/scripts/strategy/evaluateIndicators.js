const Indicators = require("./indicators");

const evaluateIndicatorValue = async (
  indicator,
  dataSymbolModel,
  timeFrame,
  period,
  multiplier,
  candleParam
) => {
  console.log(
    indicator,
    dataSymbolModel,
    timeFrame,
    period,
    multiplier,
    candleParam
  );

  if (indicator === "sma") {
    try {
      indicatorData = await Indicators.sma({
        dataSymbolModel,
        timeFrame,
        period: period,
        candleParam: candleParam,
      });
      return indicatorData;
    } catch (error) {
      console.log("Errorrr");
      console.log(error);
    }
  } else if (indicator === "candle") {
    try {
      let x = await Utils.getTodaysCandle(dataSymbolModel, timeFrame);
      // Utils.print("x: ", x)
      indicatorData = x[x.length - 1][candleParam];
      return indicatorData;
    } catch (error) {
      console.log(error);
    }
  } else if (indicator === "vwap") {
    try {
      indicatorData = await Indicators.vwap({
        dataSymbolModel,
        timeFrame,
        period: period,
        candleParam: candleParam,
      });
      return indicatorData;
    } catch (error) {
      console.log("Errorrr");
      console.log(error);
    }
  } else if (indicator === "supertrend") {
    try {
      indicatorData = await Indicators.superTrend({
        dataSymbolModel,
        timeFrame,
        period: period,
        multiplier,
        candleParam: candleParam,
      });
      return indicatorData;
    } catch (error) {
      console.log("Errorrr");
      console.log(error);
    }
  } else if (indicator === "chandeMomentum") {
    try {
      indicatorData = await Indicators.cmo({
        dataSymbolModel,
        timeFrame,
        period: period,
        candleParam: candleParam,
      });
      return indicatorData;
    } catch (error) {
      console.log("Errorrr");
      console.log(error);
    }
  } else if (indicator === "centerOfGravity") {
    try {
      indicatorData = await Indicators.cog({
        dataSymbolModel,
        timeFrame,
        period: period,
        candleParam: candleParam,
      });
      return indicatorData;
    } catch (error) {
      console.log("Errorrr");
      console.log(error);
    }
  } else if (indicator === "fisherTransform") {
    try {
      indicatorData = await Indicators.ft({
        dataSymbolModel,
        timeFrame,
        period: period,
        candleParam: candleParam,
      });
      return indicatorData;
    } catch (error) {
      console.log("Errorrr");
      console.log(error);
    }
  } else if (indicator === "rsi") {
    try {
      indicatorData = await Indicators.rsi({
        dataSymbolModel,
        timeFrame,
        period: period,
        candleParam: candleParam,
      });
      return indicatorData;
    } catch (error) {
      console.log("Errorrr");
      console.log(error);
    }
  } else if (indicator === "macd") {
    try {
      indicatorData = await Indicators.macd({
        dataSymbolModel,
        timeFrame,
        period: period,
        candleParam: candleParam,
      });
      return indicatorData;
    } catch (error) {
      console.log("Errorrr");
      console.log(error);
    }
  } else if (indicator === "ema") {
    try {
      indicatorData = await Indicators.ema({
        dataSymbolModel,
        timeFrame,
        period: period,
        candleParam: candleParam,
      });
      return indicatorData;
    } catch (error) {
      console.log("Errorrr");
      console.log(error);
    }
  }

  // if (indicator2 == "sma") {
  //     try {
  //         indicator2Data = await Indicators.sma({
  //             instrument: instrument2,
  //             apiKey: apiKey,
  //             accessToken: accessToken,
  //             timeFrame,
  //             period: period2,
  //             candleParam: candleParam2
  //         });
  //         Utils.print("indicator2Data", indicator2Data)
  //     } catch (error) {
  //         console.log(error);
  //     }
  // }
};

module.exports["evaluateIndicatorValue"] = evaluateIndicatorValue;