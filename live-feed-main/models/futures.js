const mongoose = require('mongoose');
const request = require('request');


const futures = mongoose.model('futures', new mongoose.Schema({
    future: String,
    instrument_token: Number
}))

module.exports = futures

// const options = {
//     url: `https://api.kite.trade/quote?${items.map(val => `i=${val}`).join("&")}`,
//     headers: {

//         'X-Kite-Version': 3,
//         'Authorization': `token ${api_key}:${access_token}`
//     }
// };

// function callback(error, response, body) {
//     console.log(items.map(val => `i=${val}`).join("&"))
//     if (!error && response.statusCode == 200) {
//         const info = JSON.parse(body);

//           const futures = mongoose.model('futures',new mongoose.Schema({
//             future: String,
//             instrument_token: Number
//           }))
//           var data=items.map(val=>{
//               return {'future':val,'instrument_token':info.data[val].instrument_token}
//           })
//           futures.insertMany(data).then(val=>{
//               console.log(val)
//           })
//     }
// }

// request(options, callback);