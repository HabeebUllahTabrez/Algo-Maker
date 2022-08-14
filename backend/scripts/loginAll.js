const zerodhaLogin = require("../broker/zerodha/login")
const utils = require("../utils");
const fetch = require("isomorphic-fetch");
const URL = process.env.BACKEND_URL
const getAllAccounts = () => {


    return fetch(`${URL}/api/accounts/getAllLoginAccounts`, {
        method: "GET",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",

        },
    })
        .then((res) => {
            console.log(res)
            return res.json();
        })
        .catch((err) => {
            return err;
        });

}

async function main() {
    let accounts = await getAllAccounts();
    console.log(accounts);
    for (let account of accounts) {
        await loginAccount(account);
    }

}

async function loginAccount(account) {

    let {
        user,
        userID,
        auth_type,
        name,
        broker,
        password,
        pin,
        totp_secret,
        apiKey,
        secret,
        accessToken,
        enctoken,
        balance,
    } = account;

    try {
        let response = await utils.login({
            userID,
            password,
            pin,
            apiKey,
            secret,
            auth_type,
            totp_secret,
        });
        console.log("response", response);
        if (response) {
            let newAccount = {
                user,
                userID,
                auth_type,
                name,
                broker,
                password,
                pin,
                totp_secret,
                apiKey,
                secret,
                accessToken,
                enctoken,
                balance,
            };
            newAccount.accessToken = response;
            let x = await fetch(`${URL}/api/accounts/updateAccount/${account._id}`, {
                method: "POST",
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",

                },
                body: JSON.stringify(newAccount),
            })
            if (x) {
                console.log("success")
            }

        }


    } catch (err) {
        return err;
    }
}

main();