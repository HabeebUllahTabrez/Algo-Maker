const Indicators = require("./indicators");

const evaluateIndicatorValue = async (
  indicator,
  dataSymmbolModel,
  timeFrame,
  period,
  multiplier,
  candleParam
) => {
  console.log(
    indicator,
    dataSymmbolModel,
    timeFrame,
    period,
    multiplier,
    candleParam
  );

  if (indicator === "sma") {
    try {
      indicatorData = await Indicators.sma({
        dataSymmbolModel,
        timeFrame,
        period: period,
        candleParam: candleParam,
      });
      return indicatorData;
    } catch (error) {
      console.log(error);
    }
  } else if (indicator === "candle") {
    try {
      let x = await Utils.getTodaysCandle(dataSymmbolModel, timeFrame);
      // Utils.print("x: ", x)
      indicatorData = x[x.length - 1][candleParam];
      return indicatorData;
    } catch (error) {
      console.log(error);
    }
  } else if (indicator === "vwap") {
    try {
      indicatorData = await Indicators.vwap({
        dataSymmbolModel,
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
        dataSymmbolModel,
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
        dataSymmbolModel,
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
        dataSymmbolModel,
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
        dataSymmbolModel,
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
        dataSymmbolModel,
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
        dataSymmbolModel,
        timeFrame,
        period: period,
        candleParam: candleParam,
      });
      return indicatorData.macd;
    } catch (error) {
      console.log("Errorrr");
      console.log(error);
    }
  } else if (indicator === "ema") {
    try {
      indicatorData = await Indicators.ema({
        dataSymmbolModel,
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
  else if(indicator == "atr") {
    try {
      indicatorData = await Indicators.atr({
        dataSymmbolModel,
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
  else if(indicator == "adx") {
    try {
      indicatorData = await Indicators.adx({
        dataSymmbolModel,
        timeFrame,
        period: period,
        candleParam: candleParam,
      });
      
      return indicatorData ? indicatorData.adx : indicatorData;
    } catch (error) {
      console.log("Errorrr");
      console.log(error);
    }
  }
  
  else if(indicator == "cci") {
    try {
      indicatorData = await Indicators.cci({
        dataSymmbolModel,
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
  else if(indicator == "psar") {
    try {
      indicatorData = await Indicators.psar({
        dataSymmbolModel,
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
  else if(indicator == "Roc") {
    try {
      indicatorData = await Indicators.Roc({
        dataSymmbolModel,
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
  else if(indicator == "stochastic") {
    try {
      indicatorData = await Indicators.stochastic({
        dataSymmbolModel,
        timeFrame,
        period: period,
        candleParam: candleParam,
      });
      return indicatorData.k;
    } catch (error) {
      console.log("Errorrr");
      console.log(error);
    }
  }
   else if(indicator == "wma") {
    try {
      indicatorData = await Indicators.wma({
        dataSymmbolModel,
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
  else if(indicator == "williamsR") {
    try {
      indicatorData = await Indicators.williamsR({
        dataSymmbolModel,
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