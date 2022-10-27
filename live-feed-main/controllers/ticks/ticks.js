var KiteTicker = require("kiteconnect").KiteTicker;
const mongoose = require("mongoose");
const futures = mongoose.model("futures");
const simpleStockName = mongoose.model("simpleStockNames");
const futureTables = mongoose.model("futureTable");
const futuresData = mongoose.model("futuresData");
const admin = mongoose.model("admins");
const options = mongoose.model("options");
const optionExpiryTable = mongoose.model("optionExpiryTable");
const optionsData = mongoose.model("optionsData");
const userSchema = mongoose.model("Users");
const getModel = require('../../models/createCandleModel')
const candles = require('./candles')
const { spawn } = require("child_process");
const request = require("request");
var cron = require("node-cron");
const express = require("express");
const app = express();
const WebSocket = require("ws");
require("socket.io")
const dateFormater = (time) => {
  time.setHours(time.getHours() + 5, time.getMinutes() + 30);
  time.setSeconds(0, 0);
  return (
    time.toISOString().split("T")[0] +
    " " +
    time.toISOString().split("T")[1].split(".")[0] +
    "+05:30"
  );
};

module.exports = function (io) {
  io.sockets.on("connection", (socket) => {
    // console.log("disconnect??");
    socket.on("disconnect", (data) => {
      socket.disconnect();
      console.log("disconnect");
    });
    socket.on("setSocketId", (data) => {
      console.log(socket.id, data);
      if (data)
        userSchema
          .findOneAndUpdate(
            { _id: data },
            { $set: { socketId: socket.id } },
            { new: true }
          )
          .then((data) => {
            console.log(data);
          }).catch((error) => console.log(error))
    });
  });


  var AUTH_TYPE = "totp";
  function ticks() {
    console.log("inside");
    var cacheData = {};
    admin.findOne({ auth_type: AUTH_TYPE }).then((data) => {
      console.log(data)
      // Future tick web socket
      var tickerFutures = new KiteTicker({
        api_key: data.apikey,
        access_token: data.access_token,
      });

      // set autoreconnect with 10 maximum reconnections and 5 second interval
      tickerFutures.autoReconnect(true, 100, 5);
      tickerFutures.connect();
      tickerFutures.on("ticks", onTicksFutures);
      tickerFutures.on("connect", subscribeFutures);

      tickerFutures.on("noreconnect", function () {
        console.log("noreconnect");
      });

      tickerFutures.on(
        "reconnecting",
        function (reconnect_interval, reconnections) {
          console.log(
            "Reconnecting: attempt - ",
            reconnections,
            " innterval - ",
            reconnect_interval
          );
        }
      );

      // // equites tick web socket
      // var tickerEquities = new KiteTicker({
      //   api_key: data.apikey,
      //   access_token: data.access_token,
      // });

      // // set autoreconnect with 10 maximum reconnections and 5 second interval
      // tickerEquities.autoReconnect(true, 100, 5);
      // tickerEquities.connect();
      // tickerEquities.on("ticks", onTicksEquities);
      // tickerEquities.on("connect", subscribeEquities);

      // tickerEquities.on("noreconnect", function () {
      //   console.log("noreconnect");
      // });

      // tickerEquities.on(
      //   "reconnecting",
      //   function (reconnect_interval, reconnections) {
      //     console.log(
      //       "Reconnecting: attempt - ",
      //       reconnections,
      //       " innterval - ",
      //       reconnect_interval
      //     );
      //   }
      // );

      // options tick web socket
      var tickerOptions = new KiteTicker({
        api_key: data.apikey,
        access_token: data.access_token,
      });

      // set autoreconnect with 10 maximum reconnections and 5 second interval
      tickerOptions.autoReconnect(true, 100, 5);
      tickerOptions.connect();
      tickerOptions.on("ticks", onTicksOptions);
      tickerOptions.on("connect", subscribeOptions);

      tickerOptions.on("noreconnect", function () {
        console.log("noreconnect");
      });

      tickerOptions.on(
        "reconnecting",
        function (reconnect_interval, reconnections) {
          console.log(
            "Reconnecting: attempt - ",
            reconnections,
            " innterval - ",
            reconnect_interval
          );
        }
      );



      function onTicksFutures(ticksFutures) {
        function updateFutureMinutes({ resolve, reject, tick }) {
          let currentTime = new Date(tick.exchange_timestamp || new Date());
          // console.log(currentTime)
          // let todaysDate = new Date(tick.exchange_timestamp).setHours(0, 0, 0, 0);
          io.sockets.emit("futureData", tick);
          // setExecutedOrders(tick, io);
          if (currentTime.getSeconds() == 0) {
            // console.log("Starting: ", tick)
            cacheData[tick.instrument_token] = {
              minute: new Date(new Date(currentTime).setSeconds(0, 0)),
              open: tick.last_price,
              high: tick.last_price,
              low: tick.last_price,
              close: tick.last_price,
              volume: tick.volume_traded,
              oi: tick.oi,
            };
          }
          //
          if (cacheData[tick.instrument_token]) {
            cacheData[tick.instrument_token].high = Math.max(
              cacheData[tick.instrument_token].high,
              tick.last_price
            );
            cacheData[tick.instrument_token].low = Math.min(
              cacheData[tick.instrument_token].low,
              tick.last_price
            );
          }

          if (
            cacheData[tick.instrument_token] &&
            cacheData[tick.instrument_token].minute &&
            currentTime.getSeconds() == 59
          ) {
            // console.log("Ending: ", tick)
            var future = "any"
            futures
              .find({
                instrument_token: tick.instrument_token
              }).then((data) => {
                future = data.map((val) => val.future)[0].slice(4,).toLowerCase()
                // if (future === "nifty") {
                // }
                let model = `fu_${future}_1min`
                getModel(model.toString()).findOneAndUpdate({
                  instrument_token: tick.instrument_token,
                  minute: cacheData[tick.instrument_token].minute
                }, {
                  instrument_token: tick.instrument_token,
                  minute: cacheData[tick.instrument_token].minute,
                  open: cacheData[tick.instrument_token].open,
                  high: cacheData[tick.instrument_token].high,
                  low: cacheData[tick.instrument_token].low,
                  close: tick.last_price,
                  volume: tick.volume_traded - cacheData[tick.instrument_token].volume,
                  oi: tick.oi,
                }, {
                  new: true,
                  upsert: true
                }).then(data => {
                  console.log("Last Input for Futures: in minute", data)
                  candles("fu", future, tick.instrument_token, 5)
                  candles("fu", future, tick.instrument_token, 15)
                  candles("fu", future, tick.instrument_token, 30)
                  candles("fu", future, tick.instrument_token, 60)
                })
              })

          }
        }
        var updatePromise = ticksFutures.map((tick) => {
          return new Promise((resolve, reject) =>
            updateFutureMinutes({ resolve, reject, tick })
          );
        });

        Promise.all(updatePromise);
      }

      function subscribeFutures() {

        // access todays date
        const todaysDate = new Date();
        // set todays date to 12:00 midnight
        todaysDate.setHours(0, 0, 0, 0);
        const futuresDataAccess = new Promise((resolve, reject) => {
          futureTables
            .find({ date: { $gt: todaysDate } })
            .sort("date")
            .then((dates) => {
              let fut_name = dates[0].name.toUpperCase();
              futures
                .find({
                  future: {
                    $in: [
                      new RegExp(fut_name),
                      // new RegExp(dates[1].name),
                      // new RegExp(dates[2].name),
                    ],
                  },
                })
                .then((data) => {
                  console.log(data)
                  var commodities = data.map((val) => val.instrument_token);
                  console.log(commodities)
                  resolve(commodities);
                });
            });
        });
        Promise.all([futuresDataAccess]).then((values) => {
          commodities = values[0];
          tickerFutures.subscribe(commodities);
          tickerFutures.setMode(tickerFutures.modeFull, commodities);
        });
      }

      function onTicksOptions(ticksOptions) {
        function updateOptionMinutes({ resolve, reject, tick }) {
          let currentTime = new Date(tick.exchange_timestamp || new Date());
          // let todaysDate = new Date(tick.exchange_timestamp).setHours(0, 0, 0, 0);
          io.sockets.emit("optionData", tick);
          // setExecutedOrders(tick, io);
          if (currentTime.getSeconds() == 0) {
            cacheData[tick.instrument_token] = {
              minute: new Date(new Date(currentTime).setSeconds(0, 0)),
              open: tick.last_price,
              high: tick.last_price,
              low: tick.last_price,
              close: tick.last_price,
              volume: tick.volume_traded,
              oi: tick.oi,
            };
          }
          if (cacheData[tick.instrument_token]) {
            cacheData[tick.instrument_token].high = Math.max(
              cacheData[tick.instrument_token].high,
              tick.last_price
            );
            cacheData[tick.instrument_token].low = Math.min(
              cacheData[tick.instrument_token].low,
              tick.last_price
            );
          }
          if (
            cacheData[tick.instrument_token] &&
            currentTime.getSeconds() == 59
          ) {
            let option = 'any'
            options.find({
              instrument_token: tick.instrument_token
            }).then((data) => {
              // console.log(data)
              option = data.map((val) => val.option)[0].slice(4,).toLowerCase()
              console.log(option)
              // if (future === "nifty") {
              // }
              let model = `op_${option}_1min`
              getModel(model.toString()).findOneAndUpdate({
                instrument_token: tick.instrument_token,
                minute: cacheData[tick.instrument_token].minute
              }, {
                instrument_token: tick.instrument_token,
                minute: cacheData[tick.instrument_token].minute,
                open: cacheData[tick.instrument_token].open,
                high: cacheData[tick.instrument_token].high,
                low: cacheData[tick.instrument_token].low,
                close: tick.last_price,
                volume: tick.volume_traded - cacheData[tick.instrument_token].volume,
                oi: tick.oi,
              }, {
                new: true,
                upsert: true
              }).then(data => {
                console.log("Last Input for Options: in minute ", data)
                candles("op", option, tick.instrument_token, 5)
              })
            })
            // optionsData.findOneAndUpdate({
            //     instrument_token: tick.instrument_token,
            //     minute: cacheData[tick.instrument_token].minute
            // }, {
            //     instrument_token: tick.instrument_token,
            //     minute: cacheData[tick.instrument_token].minute,
            //     open: cacheData[tick.instrument_token].open,
            //     high: cacheData[tick.instrument_token].high,
            //     low: cacheData[tick.instrument_token].low,
            //     close: tick.last_price,
            // }, {
            //     new: true,
            //     upsert: true
            // }).then(data => {
            //     // console.log("Last Input: in minute", data)
            // })
          }
        }
        var updatePromise = ticksOptions.map((tick) => {
          return new Promise((resolve, reject) =>
            updateOptionMinutes({ resolve, reject, tick })
          );
        });

        Promise.all(updatePromise);
      }

      function subscribeOptions() {
        // access todays date
        const todaysDate = new Date();
        // set todays date to 12:00 midnight
        todaysDate.setHours(0, 0, 0, 0);
        const optionsDataAccess = new Promise((resolve, reject) => {
          optionExpiryTable
            .find({ date: { $gte: todaysDate } })
            .sort("date")
            .then((dates) => {
              options
                .find({
                  option: {
                    $in: [
                      new RegExp(dates[0].name.toUpperCase()),
                      // new RegExp(dates[1].name),
                      // new RegExp(dates[2].name),
                    ],
                  },
                })
                // .select("-minutes")
                .then((data) => {
                  var commodities = data.map((val) => val.instrument_token);
                  console.log(commodities)
                  resolve(commodities);
                });
            });
        });
        Promise.all([optionsDataAccess]).then((values) => {
          commodities = values[0];
          tickerOptions.subscribe(commodities);
          tickerOptions.setMode(tickerOptions.modeFull, commodities);
        });
      }

      // function onTicksEquities(ticksEquities) {
      //   async function updateEquitiesMinutes({ resolve, reject, tick }) {
      //     let currentTime = new Date(tick.exchange_timestamp || new Date());
      //     // console.log(tick.instrument_token + ":" + currentTime + "," + tick.exchange_timestamp)
      //     // let todaysDate = new Date(tick.exchange_timestamp).setHours(0, 0, 0, 0);
      //     io.sockets.emit("equityData", tick);
      //     // setExecutedOrders(tick, io);
      //     if (currentTime.getSeconds() == 0) {
      //       cacheData[tick.instrument_token] = {
      //         minute: dateFormater(
      //           new Date(new Date(currentTime).setSeconds(0, 0))
      //         ),
      //         open:
      //           tick.last_price != undefined ? parseFloat(tick.last_price) : 0,
      //         high:
      //           tick.last_price != undefined ? parseFloat(tick.last_price) : 0,
      //         low:
      //           tick.last_price != undefined ? parseFloat(tick.last_price) : 0,
      //         close:
      //           tick.last_price != undefined ? parseFloat(tick.last_price) : 0,
      //         volume:
      //           tick.volume_traded != undefined
      //             ? parseFloat(tick.volume_traded)
      //             : 0,
      //       };
      //     }
      //     if (cacheData[tick.instrument_token]) {
      //       cacheData[tick.instrument_token].high = Math.max(
      //         cacheData[tick.instrument_token].high,
      //         tick.last_price
      //       );
      //       cacheData[tick.instrument_token].low = Math.min(
      //         cacheData[tick.instrument_token].low,
      //         tick.last_price
      //       );
      //       cacheData[tick.instrument_token].volume =
      //         tick.volume_traded != undefined
      //           ? parseFloat(tick.volume_traded)
      //           : 0;
      //     }
      //     if (
      //       cacheData[tick.instrument_token] &&
      //       currentTime.getSeconds() == 59
      //     ) {
      //       const instrument = await simpleStockName.findOne({
      //         instrument_token: tick.instrument_token,
      //       });
      //       var eq_name = instrument.equity.split(":")[1].toLowerCase();
      //       console.log(eq_name, cacheData[tick.instrument_token]);
      //       // var checkTable = await db.query(
      //       //   `SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'eq_${eq_name}_1min'`,
      //       //   "unfluke"
      //       // );
      //       // if (checkTable.length) {
      //       //   var checkValueExist = await db.query(
      //       //     `SELECT * FROM eq_${eq_name}_1min WHERE minute = '${
      //       //       cacheData[tick.instrument_token].minute
      //       //     }'`,
      //       //     "unfluke"
      //       //   );
      //       //   if (checkValueExist.length <= 0) {
      //       //     db.query(
      //       //       `INSERT INTO eq_${eq_name}_1min (instrument_token,ticker, minute, open, high, low, close,volume) VALUES ('${
      //       //         tick.instrument_token
      //       //       }','${eq_name.toUpperCase()}', '${
      //       //         cacheData[tick.instrument_token].minute
      //       //       }', '${cacheData[tick.instrument_token].open}', '${
      //       //         cacheData[tick.instrument_token].high
      //       //       }', '${cacheData[tick.instrument_token].low}', '${
      //       //         tick.last_price
      //       //       }','${cacheData[tick.instrument_token].volume}')`,
      //       //       "unfluke"
      //       //     ).then((data) => {
      //       //       console.log("Last Input: in minute", data);
      //       //       var deletedKey = delete cacheData[tick.instrument_token];
      //       //       if (deletedKey) console.log("Uploaded and deleted");
      //       //     });
      //       //   }
      //       // } else {
      //       //   db.query(
      //       //     `CREATE TABLE eq_${eq_name}_1min (instrument_token varchar(255),ticker varchar(50), minute varchar(200), open float, high float, low float, close float,volume float)`,
      //       //     "unfluke"
      //       //   )
      //       //     .then((data) => {
      //       //       console.log("Last Input: in minute", data);
      //       //     })
      //       //     .then(async (data) => {
      //       //       var checkValueExist = await db.query(
      //       //         `SELECT * FROM eq_${eq_name}_1min WHERE minute = '${
      //       //           cacheData[tick.instrument_token].minute
      //       //         }'`,
      //       //         "unfluke"
      //       //       );
      //       //       if (!checkValueExist.length) {
      //       //         db.query(
      //       //           `INSERT INTO eq_${eq_name}_1min (instrument_token,ticker, minute, open, high, low, close,volume) VALUES ('${
      //       //             tick.instrument_token
      //       //           }','${eq_name.toUpperCase()}', '${
      //       //             cacheData[tick.instrument_token].minute
      //       //           }', '${cacheData[tick.instrument_token].open}', '${
      //       //             cacheData[tick.instrument_token].high
      //       //           }', '${cacheData[tick.instrument_token].low}', '${
      //       //             tick.last_price
      //       //           }','${cacheData[tick.instrument_token].volume}')`,
      //       //           "unfluke"
      //       //         ).then((data) => {
      //       //           console.log("Last Input: in minute", data);
      //       //           var deletedKey = delete cacheData[tick.instrument_token];
      //       //           if (deletedKey) console.log("Uploaded and deleted");
      //       //         });
      //       //       }
      //       // });
      //       // }
      //       // equitiesData.findOneAndUpdate({
      //       //     instrument_token: tick.instrument_token,
      //       //     minute: cacheData[tick.instrument_token].minute
      //       // }, {
      //       //     instrument_token: tick.instrument_token,
      //       //     minute: cacheData[tick.instrument_token].minute,
      //       //     open: cacheData[tick.instrument_token].open,
      //       //     high: cacheData[tick.instrument_token].high,
      //       //     low: cacheData[tick.instrument_token].low,
      //       //     close: tick.last_price,
      //       // }, {
      //       //     new: true,
      //       //     upsert: true
      //       // }).then(data => {
      //       //     // console.log("Last Input: in minute", data)
      //       // })
      //     }
      //   }
      //   var updatePromise = ticksEquities.map((tick) => {
      //     return new Promise((resolve, reject) =>
      //       updateEquitiesMinutes({ resolve, reject, tick })
      //     );
      //   });

      //   Promise.all(updatePromise);
      // }

      // function subscribeEquities() {
      //   const equitiesDataAccess = new Promise((resolve, reject) => {
      //     simpleStockName.find().then((data) => {
      //       var commodities = data.map((val) => val.instrument_token);
      //       resolve(commodities);
      //     });
      //   });
      //   Promise.all([equitiesDataAccess]).then((values) => {
      //     commodities = values[0];
      //     tickerEquities.subscribe(commodities);
      //     tickerEquities.setMode(tickerEquities.modeFull, commodities);
      //   });
      // }
    });
  }

  // function cryptoTicks() {
  //   const url =
  //     "wss://stream.binance.com:9443/ws/btcusdt@ticker/ethusdt@ticker/shibusdt@ticker/xrpusdt@ticker/dogeusdt@ticker/maticusdt@ticker/adausdt@ticker/trxusdt@ticker";
  //   const ws = new WebSocket(url);

  //   ws.on("message", function incoming(data) {
  //     data = JSON.parse(data);
  //     io.emit("cryptoData", data);
  //     setExecutedCryptoOrders(data, io);
  //   });
  //   function onCryptoUpdate(tick) {
  //     let currentTime = new Date(tick.E);
  //     let todaysDate = new Date(tick.E).setHours(0, 0, 0, 0);
  //     io.sockets.emit("cryptoData", tick);
  //     // setExecutedOrders(tick,io)
  //     if (currentTime.getSeconds() == 0) {
  //       cryptosData
  //         .findOne({
  //           crypto: tick.s,
  //           minutes: {
  //             $elemMatch: { minute: new Date(currentTime).setSeconds(0, 0) },
  //           },
  //         })
  //         .then((data) => {
  //           if (!data) {
  //             cryptosData
  //               .findOneAndUpdate(
  //                 { crypto: tick.s },
  //                 {
  //                   $push: {
  //                     minutes: {
  //                       minute: currentTime,
  //                       open: tick.c,
  //                       high: tick.c,
  //                       low: tick.c,
  //                       close: tick.c,
  //                     },
  //                   },
  //                 },
  //                 { new: true }
  //               )
  //               .then((data) => {
  //                 // if (data)
  //                 // console.log("First Input: in minute (cryptos)", data)
  //               });
  //           }
  //         });
  //     } else if (currentTime.getSeconds() == 59) {
  //       cryptosData
  //         .findOneAndUpdate(
  //           {
  //             crypto: tick.s,
  //             minutes: {
  //               $elemMatch: { minute: new Date(currentTime).setSeconds(0, 0) },
  //             },
  //           },
  //           {
  //             $set: {
  //               "minutes.$.close": tick.c,
  //             },
  //           },
  //           { new: true }
  //         )
  //         .then((data) => {
  //           // if (data)
  //           //     console.log("Last update in minute(cryptos): ", data)
  //         });
  //     }
  //     cryptosData
  //       .findOneAndUpdate(
  //         {
  //           crypto: tick.s,
  //           minutes: {
  //             $elemMatch: {
  //               minute: new Date(currentTime).setSeconds(0, 0),
  //               high: { $lt: tick.c },
  //             },
  //           },
  //         },
  //         {
  //           $set: {
  //             "minutes.$.high": tick.c,
  //           },
  //         },
  //         { new: true }
  //       )
  //       .then((data) => {
  //         if (data) console.log("high update in minute(cryptos): ", data);
  //       });
  //     cryptosData
  //       .findOneAndUpdate(
  //         {
  //           crypto: tick.s,
  //           minutes: {
  //             $elemMatch: {
  //               minute: new Date(currentTime).setSeconds(0, 0),
  //               low: { $gt: tick.c },
  //             },
  //           },
  //         },
  //         {
  //           $set: {
  //             "minutes.$.low": tick.c,
  //           },
  //         },
  //         { new: true }
  //       )
  //       .then((data) => {
  //         if (data) console.log("low update in minute(cryptos): ", data);
  //       });
  //   }
  // }

  // cryptoTicks();

  ticks();

};
