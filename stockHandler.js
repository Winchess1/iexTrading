const express = require('express');
const app = express();
const getIextrading = require('./stockfilter');
const request = require('request');
const _ = require('underscore');
const fs = require('fs');
var stockData = [];

function extractor(cb, id, date) {
    console.log("\tloading symbol " + id)
    // var stockLink = ('https://api.iextrading.com/1.0/stock/' + id + '/chart/dynamic');  //For current values
    if (date != undefined) {
        date = date.bday.replace(/-/g, '');


        var stockLink = ('https://api.iextrading.com/1.0/stock/' + id + '/chart/date/' + date)  // History values
    } else {
        var stockLink = ('https://api.iextrading.com/1.0/stock/' + id + '/chart/date/20190125')
    }
    const sortedStocks = {
        url: stockLink,
        json: true,
        rejectUnauthorized: false,
        requestCert: true,
        agent: false
    }
    console.log('\tcurrent link' + stockLink);
    // This is blocking the getting stock from internet
    fs.readFile('./stockchart_values.json', (err, data) => {
        if (err) console.log(err);
        var body = [];
        body.data = JSON.parse(data).data;

        request(sortedStocks, function (error, response, body) {//change 'bodys' to 'body' to get real time quotes
            body.data = body; // to work with history
            console.log('\t\terror:', error); // Print the error if one occurred
            console.log('\t\tstatusCode:', response && response.statusCode);// Print the response status code if a response was received

            console.log("\tsorting data to minute,high,low...ect")

            stockData.minute = _.map(body.data, function (value) {
                return value['minute'];
            });

            stockData.high = _.map(body.data, function (value) {
                if (value['high'] == -1) {
                    return undefined;
                } else { return value['high']; }


            });
            stockData.low = _.map(body.data, function (value) {
                if (value['low'] == -1) {
                    return undefined;
                } else { return value['low']; }
            });
            stockData.volume = _.map(body.data, function (value) {
                return value['volume'];
            });
            stockData.numberOfTrades = _.map(body.data, function (value) {
                return value['numberOfTrades'];
            });
            stockData.open = _.map(body.data, function (value) {
                return value['open'];
            });
            stockData.close = _.map(body.data, function (value) {
                return value['close'];
            });
            console.log("\t\tStarting Filling the chart");
            stockData.chart = _.map(body.data, function (value) {
                return [value['minute'], value['low'], value['open'], value['close'], value['high']];
            });
            console.log("\t\tFilling the chart is completed " + (typeof (stockData) !== 'undefined' ? '100%' : 'no data'))

            console.log("\tsorting data completed " + (typeof (stockData) !== 'undefined' ? '100%' : 'false'));


            console.log("\loading " + id + " chart ");
            stockData.fiveMinute = [];
            stockData.fiveMinuteChart = [];
            stockData.fiveMinutelow = [];
            stockData.fiveMinutehigh = [];
            stockData.fiveMinuteopen = [];
            stockData.fiveMinuteclose = [];

            for (var i = 0, j = 0; i < stockData.minute.length; i += 5, j++) {
                stockData.fiveMinute[j] = _.first(stockData.minute.slice(i, i + 5));
                stockData.fiveMinutelow[j] = Math.min.apply(Math, _.filter(stockData.low.slice(i, i + 5), function (value) {
                    if (value != undefined) return value;
                }));
                stockData.fiveMinutehigh[j] = Math.max.apply(Math, _.filter(stockData.low.slice(i, i + 5), function (value) {
                    if (value != undefined) return value;
                }));;
                stockData.fiveMinuteopen[j] = _.first(_.filter(stockData.low.slice(i, i + 5), function (value) {
                    if (value != undefined) return value;
                }));
                stockData.fiveMinuteclose[j] = _.last(_.filter(stockData.low.slice(i, i + 5), function (value) {
                    if (value != undefined) return value;
                }));

                stockData.fiveMinuteChart[j] = [
                    stockData.fiveMinute[j],
                    stockData.fiveMinutelow[j],
                    stockData.fiveMinuteopen[j],
                    stockData.fiveMinuteclose[j],
                    stockData.fiveMinutehigh[j]];
            }


            console.log("\loading " + id + " chart completed ");



            /*-------------------- Calculating the Alerts----------------------------------*/

            stockData.alertCounterLow = [];
            stockData.alertCounterHigh = [];
            var counter = 0;
            console.log('calculatin for any 5m HI/LOW counsidences')
            for (i = 0, k = 0; i < stockData.fiveMinutelow.length; i++) {
                for (j = i + 1; j < stockData.fiveMinutelow.length; j++) {

                    if (stockData.fiveMinutelow[j] != undefined && stockData.fiveMinutelow[i] != undefined) {
                        if (stockData.fiveMinutelow[i] == stockData.fiveMinutelow[j]) {
                            counter++;
                        } else {
                            if (counter > 2) {

                                stockData.alertCounterLow[k] = stockData.fiveMinute[i];
                                i = j;
                                k++;
                            }
                            counter = 0;

                            break;
                        }
                    }
                }


            };
            for (i = 0, k = 0; i < stockData.fiveMinutehigh.length; i++) {
                for (j = i + 1; j < stockData.fiveMinutehigh.length; j++) {

                    if (stockData.fiveMinutehigh[i] != undefined && stockData.fiveMinutehigh[j] != undefined) {

                        if (stockData.fiveMinutehigh[i] == stockData.fiveMinutehigh[j]) {
                            counter++;



                        } else {
                            if (counter > 2) {

                                stockData.alertCounterHigh[k] = stockData.fiveMinute[i];

                                k++;
                                i = j;
                            }
                            counter = 0;

                            break;
                        }
                    }
                }


            };
            cb(stockData);
        });
    });
}

module.exports = {
    extractor: extractor,


}



