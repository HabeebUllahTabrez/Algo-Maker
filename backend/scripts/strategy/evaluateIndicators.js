const Indicators = require("./indicators");

const evaluateIndicatorValue = async (
  indicator,
  dataSymbol,
  timeFrame,
  period,
  multiplier,
  candleParam
) => {
  console.log(
    indicator,
    dataSymbol,
    timeFrame,
    period,
    multiplier,
    candleParam
  );

  if (indicator === "sma") {
    try {
      indicatorData = await Indicators.sma({
        model,
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
      let x = await Utils.getTodaysCandle(dataSymbol, timeFrame);
      // Utils.print("x: ", x)
      indicatorData = x[x.length - 1][candleParam];
      return indicatorData;
    } catch (error) {
      console.log(error);
    }
  } else if (indicator === "vwap") {
    try {
      indicatorData = await Indicators.vwap({
        model,
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
        model,
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
        model,
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
        model,
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
        model,
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
        model,
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
        model,
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
        model,
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
  //             dataSymbol: dataSymbol2,
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
