
ZERODHA_login_lambda
https://production-codes-914783289916.s3.ap-south-1.amazonaws.com/PROD_zerodhaLoginLambda-5d5d07c7-4f22-4836-9711-900ac4bf36a8_node14.x-version.zip

node server.js | pino-pretty -t "SYS:HH:MM:ss"

# LIVEPRICES
THIS is for LIVE prices API , initially it will contain just the API call like fetch LTP from DB , 

This will be an (microservice) API which will return the LTP of a symbol 

# REQUIREMENTS
Stage 1:- INPUT will take a symbol and return its LTP price ( IN-memory);
Stage 2:- Websocket Connection for a specific Symbol , all Happening In memory 

* Will get LTP of => Subscription of INDEX-(SPOT,FUT,OPTIONS) + INDEX FUTURES 
* This will not contain any DB connection , everything will happen in memory .
* For expiry Details we will connect to HIST 



# API's

- GET  /
- GET  /api
- GET  /api/expiry
- GET  /api/subscriptions
- GET /api/params    

- GET  /api/instrumentid?instrument=NFO:NIFTY21AUGFUT
- GET  /api/LTP?instrument=NFO:NIFTY21AUGFUT
- GET  /api/VWAP?instrument=NFO:NIFTY21AUGFUT
- GET  /api/VOL?instrument=NFO:NIFTY21AUGFUT
- GET  /api/OI?instrument=NFO:NIFTY21AUGFUT
