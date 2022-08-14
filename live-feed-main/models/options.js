const mongoose = require('mongoose');
const request = require('request');
const optionStockNames = mongoose.model('optionStockNames')
const optionExpiryTable = mongoose.model('optionExpiryTable')

const options = mongoose.model('options', new mongoose.Schema({
    option: String,
    instrument_token: Number
}))

module.exports = options


// optionStockNames.find().then(res => {
//     const todaysDate = new Date()
//     // set todays date to 12:00 midnight
//     todaysDate.setHours(0, 0, 0, 0)
//     optionExpiryTable.find({ date: { $gte: todaysDate } }).sort('date').then(exp => {
//         res.forEach(option => {
//             exp.forEach(exp => {
//                 var d = option.difference;
//                 var i = 1;
//                 const interval1 = setInterval(() => {
//                     if (i > option.down)
//                         clearInterval(interval1)
//                     else {
//                         var name1 = `NFO:${option.option}${exp.name}${option.start - i * d}CE`
//                         var name2 = `NFO:${option.option}${exp.name}${option.start - i * d}PE`
//                         i++;
//                         options.findOne({ option: name1 }).then(g => {
//                             if (!g) {
//                                 request({
//                                     url: `https://api.kite.trade/quote?i=${name1}`,
//                                     headers: {
//                                         'X-Kite-Version': 3,
//                                         Authorization: 'token 6kjch6to4rfjz5hp:adA1hfQ1CWAFxWASQrR7rn5eltUYmbci'
//                                     }
//                                 }, (error, response, body) => {
//                                     const x = JSON.parse(body)
//                                     console.log(x)
//                                     if (x && x.data && x.data[name1]) {
//                                         const instrument_token = x.data[name1].instrument_token
//                                         const data = {
//                                             option: name1,
//                                             instrument_token,
//                                         }
//                                         options.insertMany([data]).then(res => {
//                                             console.log(res)
//                                         })
//                                     }
//                                 })
//                             }
//                         })
//                         options.findOne({ option: name2 }).then(g => {
//                             if (!g) {
//                                 console.log(name2)
//                                 request({
//                                     url: `https://api.kite.trade/quote?i=${name2}`,
//                                     headers: {
//                                         'X-Kite-Version': 3,
//                                         Authorization: 'token 6kjch6to4rfjz5hp:adA1hfQ1CWAFxWASQrR7rn5eltUYmbci'
//                                     }
//                                 }, (error, response, body) => {
//                                     const x = JSON.parse(body)
//                                     if (x && x.data && x.data[name2]) {
//                                         const instrument_token = x.data[name2].instrument_token
//                                         const data = {
//                                             option: name2,
//                                             instrument_token,
//                                         }
//                                         options.insertMany([data]).then(res => {
//                                             console.log(res)
//                                         })
//                                     }
//                                 })
//                             }
//                         })
//                     }
//                 }, 1000);
//                 i = 0;
//                 const interval2 = setInterval(() => {
//                     if (i > option.up)
//                         clearInterval(interval2)
//                     else {
//                         var name1 = `NFO:${option.option}${exp.name}${option.start - i * d}CE`
//                         var name2 = `NFO:${option.option}${exp.name}${option.start - i * d}PE`
//                         i++;
//                         options.findOne({ option: name1 }).then(g => {

//                             if (!g) {

//                                 request({
//                                     url: `https://api.kite.trade/quote?i=${name1}`,
//                                     headers: {
//                                         'X-Kite-Version': 3,
//                                         Authorization: 'token 6kjch6to4rfjz5hp:adA1hfQ1CWAFxWASQrR7rn5eltUYmbci'
//                                     }
//                                 }, (error, response, body) => {
//                                     const x = JSON.parse(body)
//                                     if (x && x.data && x.data[name1]) {
//                                         const instrument_token = x.data[name1].instrument_token
//                                         const data = {
//                                             option: name1,
//                                             instrument_token,
//                                         }
//                                         options.insertMany([data]).then(res => {
//                                             console.log(res)
//                                         })
//                                     }
//                                 })
//                             }
//                         })
//                         options.findOne({ option: name2 }).then(g => {
//                             if (!g)

//                                 request({
//                                     url: `https://api.kite.trade/quote?i=${name2}`,
//                                     headers: {
//                                         'X-Kite-Version': 3,
//                                         Authorization: 'token 6kjch6to4rfjz5hp:adA1hfQ1CWAFxWASQrR7rn5eltUYmbci'
//                                     }
//                                 }, (error, response, body) => {
//                                     const x = JSON.parse(body)
//                                     if (x && x.data && x.data[name2]) {
//                                         const instrument_token = x.data[name2].instrument_token
//                                         const data = {
//                                             option: name2,
//                                             instrument_token
//                                         }
//                                         options.insertMany([data]).then(res => {
//                                             console.log(res)
//                                         })
//                                     }
//                                 })
//                         })
//                     }
//                 }, 1000);

//             })
//         })
//     })
// })