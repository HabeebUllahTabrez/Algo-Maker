const fetch = require("isomorphic-fetch");
const zerodhaTrade = require("../../broker/zerodha/trade");
const Strategy = require("../../models/strategies");
const { strategyCustom } = require("./strategyCustom");

const getAllStrategiesForExecution = async () => {
  try {
    let strategies = await Strategy.find({ active: true }).populate("user");
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

// main();  
