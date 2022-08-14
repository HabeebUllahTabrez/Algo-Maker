'use strict';

const utils = require('../utils');
const isAuthenticated = require("../middlewares/isAuthenticated");
const subs = require("../subscribe");
const logger = require("pino")();
const expiryUtil = require("../utils/expiry");
const { exec } = require('child_process');


const indexOptionsToSubscribe = require("../utils/indexOptionsToSubscribe");
const futuresToSubscribe = require("../utils/futuresToSubscribe");
const othersToSubscribe = require("../subscribe/subs_2")

logger.info("./routes/API.js file Loaded sucessfully!!");
module.exports = app => {


    app.get('/', async (req, res) => {
        res.json({ "status": "success", "message": "API is working" });
    })

    app.get('/api', async (req, res) => {
        res.json({ "status": "success", "message": "API is working" });
    })

    app.get('/api/feed/login', async (req, res) => {

        const ls = exec('python3 /root/TBOT/LIVEPRICES/scripts/autoLoginFeed.py  ', function (error, stdout, stderr) {
            if (error) {
                console.log(error.stack);
                console.log('Error code: ' + error.code);
                console.log('Signal received: ' + error.signal);
            }
            console.log('Child Process STDOUT: ' + stdout);
            console.log('Child Process STDERR: ' + stderr);
        });

        res.json({ "status": "success", "message": "Feed Login Command Fired up Successfully !!" });

    })

    app.get('/api/feed/status', async (req, res) => {

        try {
            logger.info("/api/feed/status");
            let params = await utils.getParams();
            let feed = await utils.checkToken(params.apikey, params.accesstoken);
            res.json({ "status": "success", "feed": feed });

        } catch (err) {
            logger.error(err);
            res.json({ "status": "error", "message": err });
        }

    })

    app.get("/api/expiry", async (req, res) => {
        try {
            let expiry = await expiryUtil.getCurrentExpiryDetails();
            res.json({ "status": "success", "expiry": expiry });
        } catch (err) {
            logger.error(err);
            res.json({ "status": "error", "message": err });
        }
    })

    app.get("/api/subscriptions", async (req, res) => {
        try {
            logger.info("/api/subscriptions");

            let options = await indexOptionsToSubscribe.getinstrumentsList();
            let futures = await futuresToSubscribe.getinstrumentsList();
            let others = await othersToSubscribe.getinstrumentsList();

            let allSubscriptions = [];
            allSubscriptions.push(...options);            
            allSubscriptions.push(...futures);
            allSubscriptions.push(...others);

            res.json({ "status": "success",  "count" : allSubscriptions.length ,"subscriptions": allSubscriptions });

        } catch (err) {
            logger.error(err);
            res.json({ "status": "error",  "message": err });
        }
    })

    app.get("/api/params", async (req, res) => {
        try {
            logger.info("/api/params");
            let params = await utils.getParams();
            res.json({ "status": "success", "params": params });

        } catch (err) {
            logger.error(err);
            res.json({ "status": "error", "message": err });
        }
    })


    app.get("/api/instrumentID", async (req, res) => {
        try {
            logger.info({ "route": "/api/instrumentID ", "query": req.query });
            let instrument = req.query.instrument;
            let id = await utils.getInstrumentID(instrument);
            let resObj = {};
            resObj["id"] = id;
            resObj['status'] = "success";
            res.json(resObj);

        } catch (err) {
            logger.error(err);
            res.json({ "status": "error", "message": err });
        }
    })

    app.get("/api/LTP", async (req, res) => {
        try {
            logger.info({ "route": "/api/LTP ", "query": req.query });
            let ltp = subs.getLTP(req.query.instrument);
            if (ltp != -1) {
                res.send({ "status": "success", ltp: ltp });
            } else {
                res.json({ "status": "error", "message": "ltp not found" });
            }
        } catch (err) {
            logger.error(err);
            res.json({ "status": "error", "message": err });
        }
    })

    app.get("/api/VWAP", async (req, res) => {
        try {
            logger.info({ "route": "/api/VWAP ", "query": req.query });
            let vwap = subs.getVWAP(req.query.instrument);
            if (vwap != -1) {
                res.send({ "status": "success", vwap: vwap });
            } else {
                res.json({ "status": "error", "message": "vwap not found" });
            }
        } catch (err) {
            logger.error(err);
            res.json({ "status": "error", "message": err });
        }
    })

    app.get("/api/VOL", async (req, res) => {
        try {
            logger.info({ "route": "/api/VOL ", "query": req.query });
            let vol = subs.getVOL(req.query.instrument);
            if (vol != -1) {
                res.send({ "status": "success", vol: vol });
            } else {
                res.json({ "status": "error", "message": "vol not found" });
            }
        } catch (err) {
            logger.error(err);
            res.json({ "status": "error", "message": err });
        }
    })

    app.get("/api/OI", async (req, res) => {
        try {
            logger.info({ "route": "/api/OI ", "query": req.query });
            let oi = subs.getOI(req.query.instrument);
            logger.info(" OI = " + oi);
            if (oi != -1) {
                res.send({ "status": "success", oi: oi });
            } else {
                vwap.json({ "status": "error", "message": "oi not found" });
            }
        } catch (err) {
            logger.error(err);
            res.json({ "status": "error", "message": err });
        }
    })

    app.get('*', function (req, res) {
        res.json({ "status": "error", "message": "Route doesn't Exist !! " });
    });

    app.post('*', function (req, res) {
        res.json({ "status": "error", "message": "Route doesn't Exist !! " });
    });


}
