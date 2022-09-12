const Utils = require("../../utils");
const { v4: uuidv4 } = require("uuid");
const cron = require("node-cron");
const Order = require("../../models/orders");
const Account = require("../../models/accounts");
const futureTables = require("../../models/futureTables");
const optionExpiryTable = require("../../models/optionExpiryTable");
const { placeTrade, getOrder } = require("../../broker/zerodha/placeTrade");
const { evaluateIndicatorValue } = require("./evaluateIndicators");

async function strategyCustom(strategy) {
  return new Promise(async (resolve, reject) => {
    try {
      // console.log(strategy);
      Utils.print("Strategy started: ", strategy.name);

      let entryTime = new Date(strategy.entryTime);

      const entryHour = entryTime.getHours();
      const entryMinute = entryTime.getMinutes();

      let exitTime = new Date(strategy.exitTime);
      const exitHour = exitTime.getHours();
      const exitMinute = exitTime.getMinutes();

      const candleParam = "close";
      let indicators = strategy.indicators;
      let exchange = strategy.exchange;
      let dataSymbol = strategy.dataSymbol;
      let orderSymbol = strategy.orderSymbol;
      let ce_pe = strategy.ce_pe.toUpperCase();
      let timeFrame = strategy.timeFrame;
      let direction = strategy.direction;
      let orderType = strategy.orderType;
      let account = await Account.findOne({
        user: strategy.user,
        isDefault: true,
      });
      let maxOrders = strategy.maxOrders;

      let quantity = strategy.quantity;
      let stopLoss = strategy.stopLoss;
      let target = strategy.target;

      let stopLossUnit = strategy.stopLossUnit;
      let targetUnit = strategy.targetUnit;
      let trailSLYPoint = strategy.trailSLYPoint;
      let trailSLXPoint = strategy.trailSLXPoint;

      let transformedOrderSymbol;
      let transformedDataSymbol;
      let dataSymmbolModel;
      let timeFrameString = timeFrame + "min";

      let prevIndicatorResults = [];

      let price;
      let pairId;
      let orderStatus;

      let shouldOrder;
      let shouldBuy, shouldSell;

      let isError;
      let count = 0;
      let ordered = false;

      // console.log(account);
      await Utils.waitForTime(entryHour, entryMinute, 0);

      const strategyTask = cron.schedule(
        `0 */${timeFrame} * * * *`,
        async () => {
          if (!ordered) {
            let entryOrder, exitOrder;
            let indicatorResults;

            // access todays date
            const todaysDate = new Date();
            // set todays date to 12:00 midnight
            todaysDate.setHours(0, 0, 0, 0);

            //------------------------------------------------------------------------
            if (exchange === "fut_fut") {
              let ex = "fu";

              if (dataSymbol.includes("BANKNIFTY")) {
                transformedOrderSymbol = "BANKNIFTY";
                transformedDataSymbol = "BANKNIFTY";
              } else {
                transformedOrderSymbol = "NIFTY";
                transformedDataSymbol = "NIFTY";
              }

              await futureTables
                .find({ date: { $gt: todaysDate } })
                .sort("date")
                .then((dates) => {
                  let fut_name = dates[0].name.toUpperCase();

                  transformedDataSymbol = transformedDataSymbol + fut_name;
                  transformedOrderSymbol =
                    "NFO:" + transformedOrderSymbol + fut_name;
                });

              dataSymmbolModel = `${ex}_${transformedDataSymbol.toLowerCase()}_${timeFrameString}`;
            } else if (exchange === "fut_opt") {
              let ex = "fu";
              let optFactor;
              let LTPOrderSymbol;

              let optEvaluationArray = orderSymbol.split("_");
              let optAddSubNumber =
                +optEvaluationArray[optEvaluationArray.length - 1];
              let optSymbol = optEvaluationArray[optEvaluationArray.length - 2];

              if (dataSymbol.includes("BANKNIFTY")) {
                transformedOrderSymbol = "BANKNIFTY";
                transformedDataSymbol = "BANKNIFTY";
                LTPOrderSymbol = "BANKNIFTY";
                optFactor = 100;
              } else {
                transformedOrderSymbol = "NIFTY";
                transformedDataSymbol = "NIFTY";
                LTPOrderSymbol = "NIFTY";
                optFactor = 50;
              }

                // Creating Futures order Model
                await futureTables
                .find({ date: { $gt: todaysDate } })
                .sort("date")
                .then((dates) => {
                  let fut_name = dates[0].name.toUpperCase();
                  transformedDataSymbol = transformedDataSymbol + fut_name;
                  LTPOrderSymbol = "NFO:" + LTPOrderSymbol + fut_name;
                });

              // Generating the opt number
              let optNumber = await Utils.getLTP(LTPOrderSymbol);
              console.log("LTP: ", optNumber);
              optNumber = Math.round(optNumber / optFactor) * optFactor;

              if (optSymbol === "+") {
                optNumber += optAddSubNumber;
              } else if (optSymbol === "-") {
                optNumber -= optAddSubNumber;
              }

              await optionExpiryTable
                .find({ date: { $gt: todaysDate } })
                .sort("date")
                .then((dates) => {
                  let opt_name = dates[0].name.toUpperCase();

                  transformedOrderSymbol =
                    "NFO:" +
                    transformedOrderSymbol +
                    opt_name +
                    optNumber +
                    ce_pe;
                });
             
                // Analysis to be done on based on this data symbol on future
              dataSymmbolModel = `${ex}_${transformedDataSymbol.toLowerCase()}_${timeFrameString}`;

            } else if (exchange === "opt_opt") {
              let ex = "op";
              let optFactor;
              let LTPOrderSymbol;

              let optEvaluationArray = orderSymbol.split("_");
              let optAddSubNumber =
                +optEvaluationArray[optEvaluationArray.length - 1];
              let optSymbol = optEvaluationArray[optEvaluationArray.length - 2];

              if (dataSymbol.includes("BANKNIFTY")) {
                transformedOrderSymbol = "BANKNIFTY";
                transformedDataSymbol = "BANKNIFTY";
                LTPOrderSymbol = "BANKNIFTY";
                optFactor = 100;
              } else {
                transformedOrderSymbol = "NIFTY";
                transformedDataSymbol = "NIFTY";
                LTPOrderSymbol = "NIFTY";
                optFactor = 50;
              }

              // Creating Futures order Model
              await futureTables
                .find({ date: { $gt: todaysDate } })
                .sort("date")
                .then((dates) => {
                  let fut_name = dates[0].name.toUpperCase();
                  LTPOrderSymbol = "NFO:" + LTPOrderSymbol + fut_name;
                });

              // Generating the opt number
              let optNumber = await Utils.getLTP(LTPOrderSymbol);
              console.log("LTP: ", optNumber);
              optNumber = Math.round(optNumber / optFactor) * optFactor;

              if (optSymbol === "+") {
                optNumber += optAddSubNumber;
              } else if (optSymbol === "-") {
                optNumber -= optAddSubNumber;
              }

              await optionExpiryTable
                .find({ date: { $gt: todaysDate } })
                .sort("date")
                .then((dates) => {
                  let opt_name = dates[0].name.toUpperCase();

                  transformedDataSymbol =
                    transformedDataSymbol + opt_name + optNumber + ce_pe;
                  transformedOrderSymbol =
                    "NFO:" +
                    transformedOrderSymbol +
                    opt_name +
                    optNumber +
                    ce_pe;
                });

              dataSymmbolModel = `${ex}_${transformedDataSymbol.toLowerCase()}_${timeFrameString}`;
            }
            //------------------------------------------------------------------------

            // transformedOrderSymbol = "NSE:RBLBANK"; // for testing only
            console.log("Symbol to be ordered: ", transformedOrderSymbol);
            console.log("DAta symbol Model: ", dataSymmbolModel);

            try {
              indicatorResults = await getBuySellArray(
                indicators,
                dataSymmbolModel,
                timeFrame,
                candleParam,
                direction,
                prevIndicatorResults
              );
              console.log(indicatorResults);
            } catch (error) {
              console.log("Error occured in evaluating strategies!");
              console.log(error);
            }

            shouldOrder =
              (indicatorResults.every((element) => element === "BUY") ||
                indicatorResults.every((element) => element === "SELL")) &&
              indicatorResults.length === indicators.length;

            shouldBuy = indicatorResults.every((element) => element === "BUY");
            shouldSell = indicatorResults.every(
              (element) => element === "SELL"
            );

            console.log("Whether we are going to order or not: ", shouldOrder);

            if (shouldOrder) {
              if (direction !== "BOTH") {
                let message = direction === "BUY" ? "Buying" : "Selling";
                console.log(message);
                pairId = uuidv4();
                try {
                  entryOrder = await makeOrder(
                    account,
                    transformedOrderSymbol,
                    direction,
                    quantity,
                    orderType,
                    exchange,
                    strategy.name,
                    pairId
                  );
                  if (!entryOrder) {
                    isError = true;
                  } else {
                    count++;
                    price = entryOrder.price;
                    ordered = true;
                    orderStatus = direction === "BUY" ? "Bought" : "Sold";

                    Utils.print("Entry Order: ", entryOrder);
                  }
                } catch (error) {
                  console.log(error);
                }
              } else if (direction === "BOTH") {
                if (shouldBuy && orderStatus !== "Bought") {
                  let message = "Buying";
                  pairId = uuidv4();
                  console.log(message);
                  try {
                    entryOrder = await makeOrder(
                      account,
                      transformedOrderSymbol,
                      "BUY",
                      quantity,
                      orderType,
                      exchange,
                      strategy.name,
                      pairId
                    );

                    if (!entryOrder) {
                      isError = true;
                    } else {
                      count++;

                      price = entryOrder.price;
                      ordered = true;
                      orderStatus = "Bought";

                      Utils.print("Entry Order: ", entryOrder);
                    }
                  } catch (error) {
                    console.log(error);
                  }
                } else if (shouldSell && orderStatus !== "Sold") {
                  let message = "Selling";
                  pairId = uuidv4();
                  console.log(message);
                  try {
                    entryOrder = await makeOrder(
                      account,
                      transformedOrderSymbol,
                      "SELL",
                      quantity,
                      orderType,
                      exchange,
                      strategy.name,
                      pairId
                    );
                    if (!entryOrder) {
                      isError = true;
                    } else {
                      count++;

                      price = entryOrder.price;
                      ordered = true;
                      orderStatus = "Sold";

                      Utils.print("Entry Order: ", entryOrder);
                    }
                  } catch (error) {
                    console.log(error);
                  }
                }
              }

              if (price === 0) {
                console.log("Order Failed! Unable to make a successful order!");
                isError = true;
              }

              if (ordered && !isError) {
                const exitOrder = await checkForSLandTarget(
                  transformedOrderSymbol,
                  account,
                  stopLoss,
                  target,
                  direction,
                  quantity,
                  price,
                  orderType,
                  exchange,
                  stopLossUnit,
                  targetUnit,
                  trailSLXPoint,
                  trailSLYPoint,
                  exitHour,
                  exitMinute,
                  dataSymmbolModel,
                  candleParam,
                  timeFrame,
                  orderStatus,
                  pairId,
                  indicators
                );

                ordered = false;

                // This has to be commented so that the trades are placed alternatively
                // orderStatus = exitOrder.direction === "BUY" ? "Bought" : "Sold";
                console.log("Exit Order: ", exitOrder);
              }
            }
          }
        }
      );

      let timeInterval = setInterval(() => {
        let currentTime = new Date();
        if (isError) {
          Utils.print("An error occured!");
          strategyTask.stop();
          clearInterval(timeInterval);
        } else if (count === maxOrders) {
          Utils.print("Max Orders limit reached!");
          strategyTask.stop();
          clearInterval(timeInterval);
        } else if (
          currentTime.getHours() >= exitHour &&
          currentTime.getMinutes() >= exitMinute
        ) {
          Utils.print("Strategy exitted");
          strategyTask.stop();
          clearInterval(timeInterval);
        } else if (
          currentTime.getHours() == exitHour &&
          currentTime.getMinutes() == exitMinute
        ) {
          Utils.print("Strategy exitted: Exit time reached");
          strategyTask.stop();
          clearInterval(timeInterval);
        }
      }, timeFrame * 10 * 1000);

      let currentTime = new Date();

      if (
        currentTime.getHours() >= exitHour &&
        currentTime.getMinutes() >= exitMinute
      ) {
        Utils.print("Strategy exitted");
        strategyTask.stop();
        clearInterval(timeInterval);
      } else if (
        currentTime.getHours() == exitHour &&
        currentTime.getMinutes() == exitMinute
      ) {
        Utils.print("Strategy exitted: Exit time reached");
        strategyTask.stop();
        clearInterval(timeInterval);
      }
    } catch (error) {
      reject(error);
    }
  });
}

const getBuySellArray = async (
  indicators,
  dataSymmbolModel,
  timeFrame,
  candleParam,
  direction,
  prevIndicatorResults
) => {
  const indicatorResults = [];

  for (let i = 0; i < indicators.length; i++) {
    const indicator = indicators[i];

    let indicatorName = indicator.indicator;
    let operator1 = indicator.operator1;
    let operator2 = indicator.operator2;
    let param1 = indicator.param1;
    let param2 = indicator.param2;
    let buyValue = indicator.value1;
    let sellValue = indicator.value2;

    let shouldBuy = false;
    let shouldSell = false;

    // console.log(
    //   indicatorName,
    //   operator1,
    //   operator2,
    //   param1,
    //   param2,
    //   buyValue,
    //   sellValue,
    //   dataSymmbolModel
    // );

    let result = await evaluateIndicatorValue(
      indicatorName,
      dataSymmbolModel,
      timeFrame,
      param1,
      param2,
      candleParam
    );

    console.log("Indicator result: ", result);
    console.log("Previous Indicator result: ", prevIndicatorResults[i]);
    console.log("Buy Value: ", buyValue);
    console.log("Sell Value: ", sellValue);

    if (direction === "BOTH") {
      // Cases to handle when the direction is both

      // checking for operator 1
      if (operator1 === "greater") {
        if (result > buyValue) {
          shouldBuy = true;
        }
      } else if (operator1 === "less") {
        if (result < buyValue) {
          shouldBuy = true;
        }
      } else if (operator1 === "crossabove") {
        if (result > buyValue && prevIndicatorResults[i] < buyValue) {
          shouldBuy = true;
        }
      } else if (operator1 === "crossbelow") {
        if (result < buyValue && prevIndicatorResults[i] > buyValue) {
          shouldBuy = true;
        }
      } else if (operator1 === "signal") {
        // idk what to do here
      }

      // checking for operator 2
      if (operator2 === "greater") {
        if (result > sellValue) {
          shouldSell = true;
        }
      } else if (operator2 === "less") {
        if (result < sellValue) {
          shouldSell = true;
        }
      } else if (operator2 === "crossabove") {
        if (result > sellValue && prevIndicatorResults[i] < sellValue) {
          shouldSell = true;
        }
      } else if (operator2 === "crossbelow") {
        if (result < sellValue && prevIndicatorResults[i] > sellValue) {
          shouldSell = true;
        }
      } else if (operator2 === "signal") {
        // idk what to do here
      }

      if ((shouldBuy && shouldSell) || (!shouldBuy && !shouldSell)) {
        indicatorResults.push("None");
      } else if (shouldBuy) {
        indicatorResults.push("BUY");
      } else if (shouldSell) {
        indicatorResults.push("SELL");
      }
    } else {
      // Cases to handle when the direction is not both
      if (direction === "BUY") {
        // Buy direction
        if (operator1 === "greater") {
          indicatorResults.push(result > buyValue ? "BUY" : "None");
        } else if (operator1 === "less") {
          indicatorResults.push(result < buyValue ? "BUY" : "None");
        } else if (operator1 === "crossabove") {
          indicatorResults.push(
            result > buyValue && prevIndicatorResults[i] < buyValue
              ? "BUY"
              : "None"
          );
        } else if (operator1 === "crossbelow") {
          indicatorResults.push(
            result < buyValue && prevIndicatorResults[i] > buyValue
              ? "BUY"
              : "None"
          );
        } else if (operator1 === "signal") {
          // idk what to do here
        }
      } else if (direction === "SELL") {
        // Sell direction
        if (operator2 === "greater") {
          indicatorResults.push(result > sellValue ? "SELL" : "None");
        } else if (operator2 === "less") {
          indicatorResults.push(result < sellValue ? "SELL" : "None");
        } else if (operator2 === "crossabove") {
          indicatorResults.push(
            result > sellValue && prevIndicatorResults[i] < sellValue
              ? "SELL"
              : "None"
          );
        } else if (operator2 === "crossbelow") {
          indicatorResults.push(
            result < sellValue && prevIndicatorResults[i] > sellValue
              ? "SELL"
              : "None"
          );
        } else if (operator2 === "signal") {
          // idk what to do here
        }
      }
    }

    prevIndicatorResults[i] = result;
  }

  return indicatorResults;
};

async function checkForSLandTarget(
  orderSymbol,
  account,
  stopLoss,
  target,
  direction,
  quantity,
  price,
  orderType,
  exchange,
  stopLossunit,
  targetunit,
  trailSLXPoint,
  trailSLYPoint,
  exitHour,
  exitMinute,
  dataSymmbolModel,
  candleParam,
  timeFrame,
  orderStatus,
  pairId,
  indicators
) {
  return new Promise(async (resolve, reject) => {
    try {
      let SL, targetPrice, LTP;
      let trailFactor = 1;
      let originalSL;
      let prevIndicatorResults = [];
      let exitOrder;

      console.log("In SL");
      // LTP = await Utils.getLTP(symbol);
      // console.log("LTP: ", LTP);

      if (direction !== "BOTH") {
        if (stopLossunit == "%" && direction == "BUY") {
          SL = price - (price * +stopLoss) / 100;
        }
        if (stopLossunit == "%" && direction == "SELL") {
          SL = price + (price * +stopLoss) / 100;
        }
        if (stopLossunit == "Rs" && direction == "BUY") {
          SL = price - +stopLoss;
        }
        if (stopLossunit == "Rs" && direction == "SELL") {
          SL = price + +stopLoss;
        }

        if (targetunit == "%" && direction == "BUY") {
          targetPrice = price + (price * +target) / 100;
        }
        if (targetunit == "%" && direction == "SELL") {
          targetPrice = price - (price * +target) / 100;
        }
        if (targetunit == "Rs" && direction == "BUY") {
          targetPrice = price + +target;
        }
        if (targetunit == "Rs" && direction == "SELL") {
          targetPrice = price - +target;
        }
      } else {
        if (stopLossunit == "%" && orderStatus == "Bought") {
          SL = price - (price * +stopLoss) / 100;
        }
        if (stopLossunit == "%" && orderStatus == "Sold") {
          SL = price + (price * +stopLoss) / 100;
        }
        if (stopLossunit == "Rs" && orderStatus == "Bought") {
          SL = price - +stopLoss;
        }
        if (stopLossunit == "Rs" && orderStatus == "Sold") {
          SL = price + +stopLoss;
        }

        if (targetunit == "%" && orderStatus == "Bought") {
          targetPrice = price + (price * +target) / 100;
        }
        if (targetunit == "%" && orderStatus == "Sold") {
          targetPrice = price - (price * +target) / 100;
        }
        if (targetunit == "Rs" && orderStatus == "Bought") {
          targetPrice = price + +target;
        }
        if (targetunit == "Rs" && orderStatus == "Sold") {
          targetPrice = price - +target;
        }
      }

      Utils.print("checking exit for ", orderSymbol);
      Utils.print("SL: ", SL);
      Utils.print("targetPrice: ", targetPrice);

      originalSL = SL;

      while (1) {
        // LTP = 1;
        LTP = await Utils.getLTP(orderSymbol);

        if (trailSLXPoint !== 0 && trailSLYPoint !== 0) {
          if (orderStatus === "Bought") {
            if (LTP >= price + +trailSLXPoint * trailFactor) {
              SL = originalSL + +trailSLYPoint * trailFactor;
              trailFactor = Math.floor((LTP - price) / +trailSLXPoint) + 1;
              console.log(
                "Current Trail factor:",
                trailFactor - 1,
                " Updated SL after trailing:",
                SL
              );
            }
          } else if (orderStatus === "Sold") {
            if (LTP <= price - +trailSLXPoint * trailFactor) {
              SL = originalSL - +trailSLYPoint * trailFactor;
              trailFactor = Math.floor((price - LTP) / +trailSLXPoint) + 1;
              console.log(
                "Current Trail factor:",
                trailFactor - 1,
                "Updated SL after trailing:",
                SL
              );
            }
          }
        }

        Utils.print("checking exit for ", orderSymbol, LTP);

        let currentTime = new Date();

        if (
          currentTime.getHours() == exitHour &&
          currentTime.getMinutes() >= exitMinute
        ) {
          Utils.print("Exit Time Reached!");
          if (orderStatus === "Bought") {
            console.log("Selling!");
            exitOrder = await makeOrder(
              account,
              orderSymbol,
              "SELL",
              quantity,
              orderType,
              exchange,
              "Exit Time Reached",
              pairId
            );
            // Utils.print("Exit Order: ", exitOrder);
          } else if (orderStatus === "Sold") {
            console.log("Buying!");
            exitOrder = await makeOrder(
              account,
              orderSymbol,
              "BUY",
              quantity,
              orderType,
              exchange,
              "Exit Time Reached",
              pairId
            );
            // Utils.print("Exit Order: ", exitOrder);
          }
          break;
        }
        if (orderStatus == "Bought") {
          if (LTP <= SL) {
            try {
              Utils.print("Stoploss hit");
              console.log("Selling!");
              exitOrder = await makeOrder(
                account,
                orderSymbol,
                "SELL",
                quantity,
                orderType,
                exchange,
                "Stoploss Hit",
                pairId
              );
              // Utils.print("Exit Order: ", exitOrder);
              break;
            } catch (error) {
              console.log(error);
            }
          } else if (LTP >= targetPrice) {
            try {
              Utils.print("Target hit");
              console.log("Selling!");
              exitOrder = await makeOrder(
                account,
                orderSymbol,
                "SELL",
                quantity,
                orderType,
                exchange,
                "Target Hit",
                pairId
              );
              // Utils.print("Exit Order: ", exitOrder);
              break;
            } catch (error) {
              console.log(error);
            }
          } else if (direction === "BOTH") {
            let indicatorResults;
            try {
              indicatorResults = await getBuySellArray(
                indicators,
                dataSymmbolModel,
                timeFrame,
                candleParam,
                direction,
                prevIndicatorResults
              );
              console.log(indicatorResults);
            } catch (error) {
              console.log("Error occured in evaluating strategies!");
              console.log(error);
            }

            let shouldOrder =
              (indicatorResults.every((element) => element === "BUY") ||
                indicatorResults.every((element) => element === "SELL")) &&
              indicatorResults.length === indicators.length;

            let shouldSell = indicatorResults.every(
              (element) => element === "SELL"
            );

            if (shouldOrder && shouldSell) {
              try {
                Utils.print("Indicator Exit");
                console.log("Selling!");
                exitOrder = await makeOrder(
                  account,
                  orderSymbol,
                  "SELL",
                  quantity,
                  orderType,
                  exchange,
                  "Indicator Exit",
                  pairId
                );
                // Utils.print("Exit Order: ", exitOrder);
                break;
              } catch (error) {
                console.log(error);
              }
            }
          }
        }
        if (orderStatus == "Sold") {
          if (LTP >= SL) {
            try {
              Utils.print("Stoploss hit");
              console.log("Buying!");
              exitOrder = await makeOrder(
                account,
                orderSymbol,
                "BUY",
                quantity,
                orderType,
                exchange,
                "Stoploss Hit",
                pairId
              );
              // Utils.print("Exit Order: ", exitOrder);
              break;
            } catch (error) {
              console.log(error);
            }
          } else if (LTP < targetPrice) {
            try {
              Utils.print("Target hit");
              console.log("Buying!");
              exitOrder = await makeOrder(
                account,
                orderSymbol,
                "BUY",
                quantity,
                orderType,
                exchange,
                "Target Hit",
                pairId
              );
              // Utils.print("Exit Order: ", exitOrder);
              break;
            } catch (error) {
              console.log(error);
            }
          } else if (direction === "BOTH") {
            let indicatorResults;
            try {
              indicatorResults = await getBuySellArray(
                indicators,
                dataSymmbolModel,
                timeFrame,
                candleParam,
                direction,
                prevIndicatorResults
              );
              console.log(indicatorResults);
            } catch (error) {
              console.log("Error occured in evaluating strategies!");
              console.log(error);
            }

            let shouldOrder =
              (indicatorResults.every((element) => element === "BUY") ||
                indicatorResults.every((element) => element === "SELL")) &&
              indicatorResults.length === indicators.length;

            let shouldBuy = indicatorResults.every(
              (element) => element === "BUY"
            );

            if (shouldOrder && shouldBuy) {
              try {
                Utils.print("Indicator Exit");
                console.log("Buying!");
                exitOrder = await makeOrder(
                  account,
                  orderSymbol,
                  "BUY",
                  quantity,
                  orderType,
                  exchange,
                  "Indicator Exit",
                  pairId
                );
                // Utils.print("Exit Order: ", exitOrder);
                break;
              } catch (error) {
                console.log(error);
              }
            }
          }
        }

        await Utils.waitForXseconds(1);
      }

      resolve(exitOrder);
    } catch (error) {
      reject(error);
    }
  });
}

const makeOrder = async (
  account,
  transformedOrderSymbol,
  direction,
  quantity,
  orderType,
  exchange,
  remarks,
  pairId
) => {
  let orderHistory;
  let newOrder;

  let order = await placeTrade(
    account._id,
    account.userID,
    account.apiKey,
    account.enctoken,
    transformedOrderSymbol,
    direction,
    quantity,
    "MARKET",
    orderType,
    0,
    0
  );

  // console.log(order);

  if (order.status !== "error") {
    orderHistory = await getOrder(
      account,
      account.userID,
      account.enctoken,
      order.data.order_id
    );

    // console.log(orderHistory);

    let price = orderHistory.data[orderHistory.data.length - 1].average_price;
    let status = orderHistory.data[orderHistory.data.length - 1].status;

    let orderDetails = new Order({
      user: account.user,
      account: account._id,
      orderId: order.data.order_id,
      exchange: exchange,
      orderSymbol: transformedOrderSymbol,
      orderType: orderType,
      direction: direction,
      price: price,
      quantity: quantity,
      remarks: remarks,
      status: status,
      pairId: pairId,
    });

    newOrder = await orderDetails.save();
  }

  return newOrder;
};

module.exports["strategyCustom"] = strategyCustom;
