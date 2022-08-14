In .env in each module add mongodb url to DATABASE environment variable.

For installing required dependencies(node modules) run: npm install
in each module.


# backend 


In backend Cors is used so in env file add new hosted frontend site url so that it accepts request from the backend


localhost:8000

backend module contains all the apis to fetch and add to databse 

-- scripts
   loginAll.js to login all clients at once this process takes time so run before market starts
   createParam.js to add new credentials for feed 
   strategyCode.js contains the strategy code which will fetch and run all strategies
   getToken.js to be run daily to get Token and save to db so feed and historical data modules can fetch data

Any new indicator must be added to indicators.js 

# feed 

localhost:4007

Only for live data feed 

run command npm start

# order

New brokers can be added to broker directory and then respective routes can be added to API.js 
and code may be added to utils.js which then imports brokers functions for login,place trade ,
client positions 

 zerodha/trade contains function for historical candle data also

run command npm start



NODE_ENV = development
PORT = 8000
CLIENT_URL = http://localhost:3000
DATABASE = 'YOUR DATABASE URL'
JWT_SECRET = 12345

```

then run backend

first you need to install whole package,

`npm install` or `npm i`

then

`npm start` (I have installed nodemon)

That's it for backend

then go to the `frontend` folder

first you need to install whole package 

`npm install`

then 

`npm start`

Thats it<:

Happy coding

note: if you face any problem then please contact with me or make a issue.

Thank you (:
# Algo_Live-
