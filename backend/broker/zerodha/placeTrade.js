const axios = require("axios");
const fetch = require("node-fetch");

// INPUT required
let enctoken =
  "XPz9+JnS+x7CB26fIwxLAWWSYuhuzWRwE/fuMcIdQjA9NNxrMbU98z/qdZo5+itAu10iUBsEJDK3phGlpnC0x5MsqKiT3h6Hbez4/xdpMwCwCIj+RDSOjA==";
let userID = "OU8828";
let variety = "regular";
let exchange = "NSE";
let tradingsymbol = "SBIN";
let t_type = "SELL";
let order_type = "MARKET";
let qty = "5";
let price = "0";
let product = "MIS";
let trigger_price = 0;

// Can keep constant
let validity = "DAY";
let squareoff = "0";
let stoploss = "0";
let trailing_stoploss = "0";
let disclosed_quantity = "0";

exports.placeTrade = async function placeTrade(
  account,
  userID,
  apiKey,
  accessToken,
  instrument,
  t_type,
  qty,
  order_type,
  product,
  price,
  trigger_price
) {
  let authorization = "enctoken " + accessToken;
  console.log(instrument);
  let url = "https://kite.zerodha.com/oms/orders/" + variety;
  let body = `variety=${variety}&exchange=${instrument.slice(
    0,
    3
  )}&tradingsymbol=${instrument.slice(
    4
  )}&transaction_type=${t_type}&order_type=${order_type}&quantity=${qty}&price=${price}&product=${product}&validity=${validity}&disclosed_quantity=${disclosed_quantity}&trigger_price=${trigger_price}&squareoff=${squareoff}&stoploss=${stoploss}&trailing_stoploss=${trailing_stoploss}&user_id=${userID}&`;
  let headers = {
    accept: "application/json, text/plain, */*",
    "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
    authorization: authorization,
    "content-type": "application/x-www-form-urlencoded",
    "x-kite-userid": userID,
    "x-kite-version": "2.9.11",
    Referer: "https://kite.zerodha.com/orders",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  };

  try {
    let res = await fetch(url, {
      headers: headers,
      body: body,
      method: "POST",
    });

    order = await res.json();
    console.log(order);
    return order;
  } catch (err) {
    console.error(err);
  }
};

exports.getOrder = async function getOrder(
  account,
  userID,
  accessToken,
  orderId
) {
  // let orderId = "220712002295292";
  // let accessToken = "HOySw1h02Pph3S6FgQgKNd/p+UOX+38gpu3xpYOi/VoN74HrlNQLuigZel5EParzgN3TSQB1rqQ5GwF+VQlV+dGSkXCxhCz2j+6n5Y0F+ijs39YtQGhCIg==";

  let authorization = "enctoken " + accessToken;
  let url = "https://kite.zerodha.com/oms/orders/" + orderId;

  let headers = {
    accept: "application/json, text/plain, */*",
    "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
    authorization: authorization,
    "content-type": "application/x-www-form-urlencoded",
    "x-kite-userid": userID,
    "x-kite-version": "2.9.11",
    Referer: "https://kite.zerodha.com/orders",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  };

  try {
    let res = await fetch(url, {
      headers: headers,
      method: "GET",
    });

    order = await res.json();
    // console.log(order);

    return order;
  } catch (err) {
    console.error(err);
  }
};

// placeTrade();
