"use strict"

var fs = require('fs');
var request = require('request');
const keyFile = 'key.json';
console.log('\tloading module TDA')

// object TDA
function tda() {

    // save this for closure;
    var that = this;
    that.accessKey = '';
    that.stockPriceNumberOfTrades = [];

    this.periodType = Object.freeze({ day: 'day', month: 'month', year: 'year', ytd: 'ytd' })


    /**
     * Returns the json access token
     * {
     *  "access_token": string,
     *   "refresh_token": string,
     *   "expires_in": int,
     *   "refresh_token_expires_in": int,
     *   "token_type": "Bearer",
     *   "create_time": int
     * }
     */
    this.getAccessKey = function getAccessKey() {

        // if it's not empty - return it
        if (that.accessKey != '') {
            console.log('TDA - cached access key')
            return that.accessKey;
        }
        // show saved key if it exists
        // if file exists
        if (!fs.existsSync(keyFile)) {
            console.log('TDA - ' + keyFile + ' file not found');
            return { access_token: '' };
        }
        console.log('TDA - read file')
        that.accessKey = JSON.parse(fs.readFileSync(keyFile));
        return that.accessKey;
    }

    /**
     * Request access token from TDA
     * @param {string} code - request code from TDA
     */
    this.requestToken = function (code, done) {
        var headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        }

        var options = {
            //see the Authentication API's Post Access Token method for more information
            url: 'https://api.tdameritrade.com/v1/oauth2/token',
            method: 'POST',
            headers: headers,
            //POST Body params
            form: {
                'grant_type': 'authorization_code',
                'access_type': 'offline',
                'code': code, //get the code
                'client_id': 'AMATUSEVSKI3@AMER.OAUTHAP',
                'redirect_uri': 'http://localhost:3000/key'
            }
        }

        console.log('TDA requesting token');

        // Post Access Token request
        request(options, function (error, response, body) {
            console.log('TDA - code', response.statusCode);

            if (!error && response.statusCode == 200) {

                //see Post Access Token response summary for what authReply contains
                let authReply = JSON.parse(body);

                // add to current time
                authReply.create_time = + new Date();

                // save key to file
                fs.writeFile('key.json', JSON.stringify(authReply), function (err) {
                    if (err) throw err;
                    console.log('New Key Saved');
                });

                done(null, response.statusCode, authReply);
            } else {
                done({ error, body, statusCode: response.statusCode }, null);
            }
        })
    }


    /**
     * get price history
     * @param {string} symbol - stock symbol
     * @param {tda.periodType} periodType The type of period to show. Valid values are _day_, _month_, _year_, or _ytd_ (year to date). Default is day.
     * @param {*} period - day: 1, 2, 3, 4, 5, 10*; month: 1*, 2, 3, 6; year: 1*, 2, 3, 5, 10, 15, 20 ytd: 1*
     * @param {*} frequency - minute: 1*, 5, 10, 15, 30; daily: 1*; weekly: 1*; monthly: 1*
     * @param {*} frequencyType - day: minute*; month: daily, weekly*; year: daily, weekly, monthly*; ytd: daily, weekly*;
     * @param {*} needExtendedHoursData - true | false
     */
    this.getPriceHistory = function (symbol, periodType, period, frequency, frequencyType, needExtendedHoursData, done) {
        // function get_tda_price(res, stock, done) {
        var headers = {
            'Authorization': that.getAccessKey().access_token
        }


        var options = {
            //see the Authentication API's Post Access Token method for more information
            url: `https://api.tdameritrade.com/v1/marketdata/${symbol}/pricehistory?apikey=AMATUSEVSKI3&periodType=${periodType}&period=${period}&frequencyType=${frequencyType}&frequency=${frequency}&needExtendedHoursData=${needExtendedHoursData}`,
            method: 'GET',
            headers: headers
        }

        console.log(options);

        request(options, function (error, response, body) {
            console.log(`TDA - get prices for ${symbol} HTTP status ${response.statusCode}`);
            if (!error && response.statusCode == 200) {
                done(null, JSON.parse(body))
            } else {
                done(error, body);
            }
        })
    }
}

// return instance of TDA object
module.exports = new tda();
console.log('\tloading module TDA END');