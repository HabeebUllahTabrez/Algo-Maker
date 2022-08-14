const Account = require("../models/accounts");
const zerodhaLogin = require("../broker/zerodha/login");
const zerodhaTrade = require("../broker/zerodha/trade");
const fetch = require("isomorphic-fetch");
const cron = require("node-cron");
const utils = require("../utils");

exports.addAccount = async (req, res) => {
  const {
    user,
    userID,
    auth_type,
    broker,
    password,
    pin,
    totp_secret,
    apiKey,
    secret,
    accessToken,
    enctoken,
    balance,
  } = req.body;

  let newAccount = new Account({
    user,
    userID,
    auth_type,
    broker,
    password,
    pin,
    totp_secret,
    apiKey,
    secret,
    accessToken,
    enctoken,
    balance,
    isDefault: false,
  });

  try {
    const savedAccount = await newAccount.save();
    res.json(savedAccount);
  } catch (err) {
    res.json({ message: err });
  }
};

exports.makeDefaultAccount = async (req, res) => {
  const id = req.params.id;
  const accountId = req.body.accountId;

  try {
    const accounts = await Account.find({ user: id, isDefault: true });
    if (accounts) {
      for (const account of accounts) {
        account.isDefault = false;
        await account.save();
      }
    }

    const defaultAccount = await Account.findOne({ _id: accountId });
    defaultAccount.isDefault = true;
    const updatedAccount = await defaultAccount.save();

    res.json(updatedAccount);
  } catch (error) {
    res.json(error);
  }
};

exports.deleteAccount = async (req, res) => {
  const id = req.params.id;
  const accountId = req.body.accountId;

  try {
    const response = await Account.deleteOne({ user: id, _id: accountId });

    res.json({
      message: "Account deleted successfully!",
      data: response,
    });
  } catch (error) {
    res.json({
      message: "Error while deleting Account!",
      error: error,
    });
  }
};

exports.getAccounts = async (req, res) => {
  try {
    let id = req.params.id;
    const accounts = await Account.find({ user: id });
    res.json(accounts);
  } catch (err) {
    res.json({ message: err });
  }
};

exports.updateAccount = async (req, res) => {
  const {
    userID,
    accountId,
    broker,
    password,
    auth_type,
    pin,
    totp_secret,
    apiKey,
    secret,
    accessToken,
    enctoken,
    balance,
  } = req.body;

  try {
    const user = req.params.id;
    const updatedAccount = await Account.updateOne(
      { _id: accountId },
      {
        userID,
        user,
        broker,
        password,
        auth_type,
        pin,
        totp_secret,
        apiKey,
        secret,
        accessToken,
        enctoken,
        balance,
      }
    );
    res.json(updatedAccount);
  } catch (err) {
    res.json({ message: err });
  }
};

exports.loginAccount = async (req, res) => {
  try {
    let id = req.params.id;
    let account = await Account.findById(id);

    if (account == null) {
      res.json({ message: "Account not found" });
    } else {
      let token = await zerodhaLogin.getZerodhaAccessToken({
        userID: account.userID,
        password: account.password,
        pin: account.pin,
        apiKey: account.apiKey,
        secret: account.secret,
        auth_type: account.auth_type,
        totp_secret: account.totp_secret,
      });
      if (token) {
        account.accessToken = token;

        await account.save();
        console.log("hellu");
        res.json(account);
      } else {
        res.json({ message: "Token not found" });
      }
    }
  } catch (error) {
    res.json({ message: error });
  }
};

exports.loginOrderAccount = async () => {
  try {
    // let id = req.params.id;
    let accounts = await Account.find({ isDefault: true });

    if (accounts == null) {
      // res.json({ message: "Account not found" });
      console.log("accounts not found!");
    } else {
      console.log("Users Accounts: ", accounts);
      for (const account of accounts) {
        let token = await zerodhaLogin.getZerodhaEncToken({
          userID: account.userID,
          password: account.password,
          pin: account.pin,
          apiKey: account.apiKey,
          secret: account.secret,
          auth_type: account.auth_type,
          totp_secret: account.totp_secret,
        });
        if (token) {
          account.enctoken = token.access_token;
          await account.save();
          console.log(
            "Enc token generated for user (",
            account.userID,
            ") is: ",
            token.access_token
          );

          // res.json(account);
        } else {
          // res.json({ message: "Token not found" });
          console.log(
            "Enc token cannot be generated for user (",
            account.userID,
            ")"
          );
        }
      }
    }
  } catch (error) {
    // res.json({ message: error });
    console.log(error);
  }
};

exports.getPositions = async (req, res) => {
  try {
    let id = req.params.id;
    let account = await Account.findById(id);

    if (account == null) {
      res.json({ message: "Account not found" });
    } else {
      let positions = await utils.getClientPositions(
        account.apiKey,
        account.accessToken
      );
      if (positions) {
        res.json(positions);
      } else {
        res.json({ message: "Positions not found" });
      }
    }
  } catch (error) {
    res.json({ message: error });
  }
};

exports.getAllLoginAccounts = async (req, res) => {
  try {
    let accounts = await Account.find({});
    res.json(accounts);
  } catch (err) {
    res.json({ message: err });
  }
};
