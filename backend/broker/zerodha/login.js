const puppeteer = require('puppeteer');
const kiteConnect = require("kiteconnect").KiteConnect;
const logger = require('pino')();
const totp = require("totp-generator");
const request = require("request")

const BASE_URL = "https://kite.trade";
const axios = require('axios')

function getZerodhaEncToken({ userID, password, apiKey, pin, secret, auth_type, totp_secret }) {
    if (userID == undefined) return Promise.reject(" undefined userID  ");
    if (password == undefined) return Promise.reject(" undefined password  ");
    // if (apiKey == undefined) return Promise.reject(" undefined apiKey  ");
    // if (secret == undefined) return Promise.reject(" undefined secret  ");
    if (auth_type == undefined) { auth_type = "pin"; }
    if (auth_type == "pin" && pin == undefined) return Promise.reject(" undefined pin ");
    if (auth_type == "totp" && totp_secret == undefined) return Promise.reject(" undefined totp_secret ");
    if (auth_type == "totp" && totp_secret.length != 32) return Promise.reject(" length of totp_secret is not 32 ")

    return new Promise(async (resolve, reject) => {
        const url = process.env.YODHA_LOGIN_LAMBDA
        // let headers = {
        //     "content-type": "application/json"
        // }
        let body = {

            "userID": userID,
            "password": password,
            "pin": pin,
            "auth_type": auth_type,
            "totp_secret": totp_secret
        }
        console.log(body)
        const options = {
            method: 'POST',
            url: url,
            headers: { 'content-type': 'application/json' },
            body: body,
            json: true
        };
        try {

            request(options, function (error, response, body) {
                if (error) {
                    reject(error)
                    throw new Error(error)
                }
                resolve(body)
                // console.log(body);
            })

        } catch (err) {
            console.error(err);
            reject(err)
        }


    })

}

function getZerodhaAccessToken({ userID, password, pin, apiKey, secret, auth_type, totp_secret }) {
    // getZerodhaAccessToken() => will return access token 

    if (userID == undefined) return Promise.reject(" undefined userID  ");
    if (password == undefined) return Promise.reject(" undefined password  ");
    // if (apiKey == undefined) return Promise.reject(" undefined apiKey  ");
    // if (secret == undefined) return Promise.reject(" undefined secret  ");
    if (auth_type == undefined) { auth_type = "pin"; }
    if (auth_type == "pin" && pin == undefined) return Promise.reject(" undefined pin ");
    if (auth_type == "totp" && totp_secret == undefined) return Promise.reject(" undefined totp_secret ");
    if (auth_type == "totp" && totp_secret.length != 32) return Promise.reject(" length of totp_secret is not 32 ")

    return new Promise(async (resolve, reject) => {

        try {
            let loginUrl = BASE_URL + "/connect/login?api_key=" + apiKey;
            logger.info("loginUrl : " + loginUrl);

            const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox'] });
            //const browser = await puppeteer.launch({headless: false,slowMo: 5 , args: ['--no-sandbox'] });
            const page = await browser.newPage();
            await page.goto(loginUrl);

            await page.waitForSelector('#userid');
            await page.type('#userid', userID);
            await page.type('#password', password);
            await page.evaluate(() => {
                let elements = document.getElementsByClassName('button-orange');
                elements[0].click();
            });


            if (auth_type == "pin") {
                await page.waitForSelector('#pin');
                await page.type('#pin', pin);
                await page.evaluate(() => {
                    let elements = document.getElementsByClassName('button-orange');
                    elements[0].click();
                });
            } else if (auth_type.toLowerCase() == "totp") {

                let currTOTP = "123456";
                try {
                    currTOTP = await totp(totp_secret);
                    console.log("TOTP = ", currTOTP)
                } catch (err) {
                    reject(" Problem with TOTP generation , check totp_secret");
                }
                await page.waitForSelector('#totp');
                await page.type('#totp', currTOTP);
                await page.evaluate(() => {
                    let elements = document.getElementsByClassName('button-orange');
                    elements[0].click();
                });
            } else {
                reject(" Invalid auth_type");
            }


            await page.waitForNavigation();


            //  after Successfull login
            let redirectURL = await page.url();
            let url = new URL(redirectURL);
            let origin = await url.origin;
            let pathname = await url.pathname;
            let base_url = origin + pathname;

            // If the user is logging in for the first time : he has to Authorize the APP
            if (base_url == "https://kite.zerodha.com/connect/authorize") {
                console.log({ "message": " New USER , Logging in for the First Time " });

                await page.evaluate(() => {
                    let elements = document.getElementsByClassName('button-orange');
                    elements[0].click();
                });
                await page.waitForNavigation();

                redirectURL = await page.url();
                logger.info({ "redirectURL": redirectURL });
                url = new URL(redirectURL);
            }

            let request_token = await url.searchParams.get('request_token');
            logger.info({ "request_token": request_token });

            if (request_token != null && request_token != undefined) {

                let kc = new kiteConnect({
                    api_key: apiKey
                });

                try {
                    let resp = await kc.generateSession(request_token, secret);
                    console.log(resp);

                    if (resp.access_token != null || resp.access_token != undefined) {  // status is OK 
                        logger.info("\n Access Token Generated Successfully =>" + resp.access_token);
                        resolve(resp.access_token);
                    } else {
                        logger.error("Error while Generating access_token  =>" + resp);
                        reject(resp);
                    }
                } catch (err) {
                    reject(err);
                }

            } else {
                logger.error(" request_token is null or undefined ");
                reject("request_token is null or undefined ");
            }
        } catch (err) {
            reject(err);
        }
    });
}




module.exports['getZerodhaAccessToken'] = getZerodhaAccessToken;
module.exports['getZerodhaEncToken'] = getZerodhaEncToken;