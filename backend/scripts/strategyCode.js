const fetch = require("isomorphic-fetch");
const zerodhaTrade = require("../broker/zerodha/trade");
const { v4: uuidv4 } = require("uuid");
const cron = require("node-cron");
const Strategy = require("../models/strategies");
const Order = require("../models/orders");
const futureTables = require("../models/futureTables");
const { placeTrade, getOrder } = require("../broker/zerodha/placeTrade");
const { evaluateIndicatorValue } = require("./evaluateIndicators");
const credData = require("../data/credentials.json");
const Utils = require("../utils");
const URL = process.env.BACKEND_URL;
let apiKey = credData.api_key;
let accessToken = credData.access_token;

let prevIndicatorResults = [];

const getAllStrategiesForExecution = async () => {
  try {
    let strategies = await Strategy.find({ active: true })
      .populate("user")
    return strategies;
  } catch (error) {
    return error;
  }
};

async function main() {
  try {
    let strategies = await getAllStrategiesForExecution();
    // console.log("strategies: ", strategies);
    let newPromise;

    if (strategies.length > 0) {
      // for (let i = 0; i < 1; i++) {
      //   strategyCustom(strategies[i]);
      // }
      newPromise = strategies.map((strategy) => {
        return new Promise((resolve, reject) => {
          strategyCustom(strategy);
        });
      });

      Promise.all(newPromise);
    } else {
      console.log("No strategies for execution!");
    }
  } catch (error) {
    console.log(error);
  }
}

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

      // let instrument = "NSE:" + strategy.instrument1;

      const candleParam = "close";
      let indicators = strategy.indicators;
      let exchange = strategy.exchange;
      let dataSymbol = strategy.dataSymbol;
      let orderSymbol = strategy.orderSymbol;
      let timeFrame = strategy.timeFrame;
      let direction = strategy.direction;
      let orderType = strategy.orderType;
      let account = await Account.findOne({ user: strategy.user, isDefault: true })

      let quantity = strategy.quantity;
      let stopLoss = strategy.stopLoss;
      let target = strategy.target;

      let stopLossUnit = strategy.stopLossUnit;
      let targetUnit = strategy.targetUnit;
      let trailSLYPoint = strategy.trailSLYPoint;
      let trailSLXPoint = strategy.trailSLXPoint;

      let transformedOrderSymbol;

      prevIndicatorResults = [];

      let price;
      let pairId;
      let orderStatus;

      let shouldOrder;
      let shouldBuy, shouldSell;

      let isError;

      // console.log(account);
      await Utils.waitForTime(entryHour, entryMinute, 0);

      if (orderSymbol.includes("BANKNIFTY")) {
        transformedOrderSymbol = "BANKNIFTY";
      } else {
        transformedOrderSymbol = "NIFTY";
      }

      // access todays date
      const todaysDate = new Date();
      // set todays date to 12:00 midnight
      todaysDate.setHours(0, 0, 0, 0);

      await futureTables
        .find({ date: { $gt: todaysDate } })
        .sort("date")
        .then((dates) => {
          let fut_name = dates[0].name.toUpperCase();

          transformedOrderSymbol = "NFO:" + transformedOrderSymbol + fut_name;
        });

      // transformedOrderSymbol = "NSE:RBLBANK";
      console.log("Symbol to be ordered: ", transformedOrderSymbol);

      const strategyTask = cron.schedule(`0 */${timeFrame} * * * *`, async () => {
        let entryOrder, exitOrder;
        let ordered = false;

        let indicatorResults;

        try {
          indicatorResults = await getBuySellArray(
            indicators,
            dataSymbol,
            timeFrame,
            candleParam,
            direction
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
        shouldSell = indicatorResults.every((element) => element === "SELL");

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
                "Indicator entry",
                pairId
              );

              price = entryOrder.price;
              ordered = true;
              orderStatus = direction === "BUY" ? "Bought" : "Sold";

              Utils.print("Entry Order: ", entryOrder);
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
                  "Indicator entry",
                  pairId
                );

                price = entryOrder.price;
                ordered = true;
                orderStatus = "Bought";

                Utils.print("Entry Order: ", entryOrder);
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
                  "Indicator entry",
                  pairId
                );

                price = entryOrder.price;
                ordered = true;
                orderStatus = "Sold";

                Utils.print("Entry Order: ", entryOrder);
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
              dataSymbol,
              candleParam,
              timeFrame,
              orderStatus,
              pairId,
              indicators
            );

            // This has to be commented so that the trades are placed alternatively
            // orderStatus = exitOrder.direction === "BUY" ? "Bought" : "Sold";
            console.log("Exit Order: ", exitOrder);
          }
        }
      });

      setInterval(() => {
        let currentTime = new Date();
        if(isError) {
          Utils.print("An error occured!");
          strategyTask.stop();
        }
        
        if (
          currentTime.getHours() >= exitHour &&
          currentTime.getMinutes() >= exitMinute
        ) {
          Utils.print("Strategy exitted");
          strategyTask.stop();
        }

        if (
          currentTime.getHours() == exitHour &&
          currentTime.getMinutes() == exitMinute
        ) {
          Utils.print("Strategy exitted: Exit time reached");
          strategyTask.stop();
        }
      }, 1 * 60 * 1000)

    } catch (error) {
      reject(error);
    }
  });
}

const getBuySellArray = async (
  indicators,
  dataSymbol,
  timeFrame,
  candleParam,
  direction
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
    //   sellValue
    // );

    let result = await evaluateIndicatorValue(
      indicatorName,
      dataSymbol,
      timeFrame,
      param1,
      param2,
      candleParam
    );

    console.log("Indicator Result: ", result);
    console.log("Previous Indicator Result: ", prevIndicatorResults[i]);
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
  dataSymbol,
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
      prevIndicatorResults = [];

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

        if (orderStatus === "Bought") {
          if (LTP >= price + +trailSLXPoint * trailFactor) {
            SL = originalSL + +trailSLYPoint * trailFactor;
            SL.toFixed(2);
            trailFactor = Math.floor((LTP - price) / +trailSLXPoint) + 1;
            console.log(
              "Next Trail factor:",
              trailFactor,
              " Updated SL after trailing:",
              SL
            );
          }
        } else if (orderStatus === "Sold") {
          if (LTP <= price - +trailSLXPoint * trailFactor) {
            SL = originalSL - +trailSLYPoint * trailFactor;
            SL.toFixed(2);
            trailFactor = Math.floor((price - LTP) / +trailSLXPoint) + 1;
            console.log(
              "Next Trail factor:",
              trailFactor,
              "Updated SL after trailing:",
              SL
            );
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
                dataSymbol,
                timeFrame,
                candleParam,
                direction
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
                dataSymbol,
                timeFrame,
                candleParam,
                direction
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

  if (order) {
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

// main();
