const express = require('express');
const app = express();
const getIextrading = require('./stockfilter');
const request = require('request');
const _ = require('underscore');
var stockData = [];

function extractor(cb, id) {
    console.log("\tloading symbol " + id)
    var stockLink = ('https://api.iextrading.com/1.0/stock/' + id + '/chart/dynamic');

    const sortedStocks = {
        url: stockLink,
        json: true,
        rejectUnauthorized: false,
        requestCert: true,
        agent: false
    }

    request(sortedStocks, function (error, response, body) {

        console.log('\t\terror:', error); // Print the error if one occurred
        console.log('\t\tstatusCode:', response && response.statusCode);// Print the response status code if a response was received

        console.log("\tsorting data to minute,high,low...ect")
        
            stockData.minute = _.map(body.data, function (value) {
                return value['minute'];
            });
          
            stockData.high = _.map(body.data, function (value) {
                return value['marketHigh'];
            });
            stockData.low = _.map(body.data, function (value) {
                return value['marketLow'];
            });
            stockData.volume = _.map(body.data, function (value) {
                return value['marketVolume'];
            });
            stockData.numberOfTrades = _.map(body.data, function (value) {
                return value['marketNumberOfTrades'];
            });
            stockData.open = _.map(body.data, function (value) {
                return value['marketOpen'];
            });
            stockData.close = _.map(body.data, function (value) {
                return value['marketClose'];
            });
          
        console.log("\tsorting data completed " + (typeof(stockData) !== 'undefined'?'100%':'false') );

        cb(stockData);
    });
}

module.exports = {
    extractor: extractor,

}