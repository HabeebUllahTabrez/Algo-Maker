const params = require("../models/params");
const futures = require("../models/futures");

async function main() {
    try {
        let newParam = new params({
            // { "user": "", "pswd": "algo@0034", "twofa": "101090", "api_key": "n8qk8yhoep8ivw89", "api_secret": "v7v08jvpbj2d2urhux31hs8mksfqiccv", "access_token": "cb35sBk6oG6Pe5XeayEyrIA2g4K0uowC" }
            userID: "ZV5170",
            password: "algo@0034",
            pin: "101090",
            apikey: "n8qk8yhoep8ivw89",
            secret: "0lzdxyx9ralumaa83nd973560jw8rq72",
            accesstoken: "cb35sBk6oG6Pe5XeayEyrIA2g4K0uowC",
            enctoken: "",
            auth_type: "",
            totp_secret: ""
        });
        await newParam.save();
        console.log("Successfully created new param");

    } catch (error) {
        console.log(error);
    }


}


main()