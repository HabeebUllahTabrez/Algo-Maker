// Find Next Expiry details function in-memory , NO DB needed 

var date = new Date();
var daily = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31"]
var weekly = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "O", "N", "D"];
var monthly = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

var expiryHolidays = [
    new Date("2021-05-13"),
    new Date("2021-08-19"),
    new Date("2021-11-04"),
]

function isExpiryHoliday(expiryDate) {

    // FOR IST TIME of 0:00 UTC
    expiryDate.setHours(5);
    expiryDate.setMinutes(30);
    expiryDate.setSeconds(0);

    for (let i = 0; i < expiryHolidays.length; i++) {
        //console.log( expiryHolidays[i].toString() , " : ",expiryDate.toString() , expiryHolidays[i].toString()  === expiryDate.toString() )
        if (expiryHolidays[i].toString() === expiryDate.toString()) {
            return true;
        }
    }
    return false;
}

function isLastThursday(dt) {

    if (Object.prototype.toString.call(dt) !== "[object Date]") {
        console.error("isLastThursday() requires Date object found ", typeof (dt));
    }

    var after7days = new Date(dt);
    after7days.setHours(dt.getHours() + 7 * 24 * 1);

    if (after7days.getMonth() == dt.getMonth()) {
        return false;
    } else {
        return true;
    }
}

function getCurrentExpiryDetails() {

    for (let i = 1; i <= 7; i++) {

        //  var dt = new Date(2021,0 ,23);  23-Jan-201

        var dt = new Date();
        dt.setHours( 24*(i-1) + 23 );
        dt.setMinutes(59);
        dt.setSeconds(58);

        //console.log(dt , dt.toLocaleString("en-US"));

        // if it is a thursday 
        if (dt.getDay() == 4) { 
            
            // create a copy to pass that in function so dt doesn't get modified .
            let dtCopy = new Date(dt);
            if (isExpiryHoliday(dtCopy)) {
                console.log(dtCopy, " is a Expiry Holiday !!");
                dt.setHours( dt.getHours() - 24 );
            }

            let expDate = new Date(dt);
            let yyyy = expDate.getFullYear() % 100;
            let mm   = expDate.getMonth();
            let dd   = expDate.getDate();

            //console.log(dd , " - " , mm , " - " ,yyyy , " - " );

            result = {
                date: expDate,
                year: JSON.stringify(yyyy),
                month: isLastThursday(expDate) == true ? monthly[mm] :weekly[mm],
                day:   isLastThursday(expDate) == true ? "" : daily[dd],
                futExpiryMonth: monthly[mm],
                nextFutExpiryMonth: monthly[(mm + 1) % 12]
            }
               
            //console.log(result);
            return result;
        }


    }
}

function getNextExpiryDetails() {

    for (let i = 1+7; i <= 7+7; i++) {

        //  var dt = new Date(2021,0 ,23);  23-Jan-201

        var dt = new Date();
        dt.setHours( 24*(i-1) + 23 );
        dt.setMinutes(59);
        dt.setSeconds(58);

        //console.log(dt , dt.toLocaleString("en-US"));

        // if it is a thursday 
        if (dt.getDay() == 4) { 
            
            // create a copy to pass that in function so dt doesn't get modified .
            let dtCopy = new Date(dt);
            if (isExpiryHoliday(dtCopy)) {

                console.log(dtCopy, " is a Expiry Holiday !!");
                dt.setHours( dt.getHours() - 24 );

            }

            let expDate = new Date(dt);
            yyyy = expDate.getFullYear() % 100;
            mm   = expDate.getMonth();
            dd   = expDate.getDate();

            result = {
                date: expDate,
                year: JSON.stringify(yyyy),
                month: isLastThursday(expDate) == true ? monthly[mm] :weekly[mm],
                day:   isLastThursday(expDate) == true ? "" : daily[dd],
                futExpiryMonth: monthly[mm],
                nextFutExpiryMonth: monthly[(mm + 1) % 12]
            }
               
            console.log(result);
            return result;
        }


    }
}


module.exports['getCurrentExpiryDetails'] = getCurrentExpiryDetails;
module.exports['getNextExpiryDetails'] = getNextExpiryDetails;