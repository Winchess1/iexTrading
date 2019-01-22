const express = require('express');
const app = express();
const getIextrading = require('./stockfilter');
const request = require('request');
const _ = require('underscore');
const fs = require('fs');
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

// This is blocking the getting stock from internet
    fs.readFile('./stockchart_values.json',(err,data)=>{
        if (err)console.log(err);
    var body =[];  
      body.data =JSON.parse(data).data;

    request(sortedStocks, function (error, response, body) {//change bodys to body to get real time quotes

        console.log('\t\terror:', error); // Print the error if one occurred
        console.log('\t\tstatusCode:', response && response.statusCode);// Print the response status code if a response was received

        console.log("\tsorting data to minute,high,low...ect")
        
            stockData.minute = _.map(body.data, function (value) {
                return value['minute'];
            });
          
            stockData.high = _.map(body.data, function (value) {
                return value['high'];
            });
            stockData.low = _.map(body.data, function (value) {
                return value['low'];
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
            stockData.chart = _.map(body.data, function (value){               
                return [value['minute'],value['low'],value['open'],value['close'],value['high']];
            });
            console.log("\t\tFilling the chart is completed " + (typeof(stockData) !== 'undefined'?'100%':'no data'))
          
        console.log("\tsorting data completed " + (typeof(stockData) !== 'undefined'?'100%':'false') );

                   
        console.log("\loading "+id+" chart " );
            stockData.fiveMinute = [];
            stockData.fiveMinuteChart = [];
            stockData.fiveMinutelow = [];
            stockData.fiveMinutehigh = [];
            stockData.fiveMinuteopen = [];
            stockData.fiveMinuteclose = [];
        
            for (var i = 0, j = 0; i < stockData.minute.length; i += 5, j++) {
                stockData.fiveMinute[j] = _.first(stockData.minute.slice(i, i + 5));
                stockData.fiveMinutelow[j] = Math.min.apply(Math, stockData.low.slice(i, i + 5));
                stockData.fiveMinutehigh[j] = Math.max.apply(Math, stockData.high.slice(i, i + 5));
                stockData.fiveMinuteopen[j] = _.first(stockData.open.slice(i, i + 5));
                stockData.fiveMinuteclose[j] = _.last(stockData.close.slice(i, i + 5));                
                

                stockData.fiveMinuteChart[j] = [
                    stockData.fiveMinute[j],
                    stockData.fiveMinutelow[j],
                    stockData.fiveMinuteopen[j],
                    stockData.fiveMinuteclose[j],
                    stockData.fiveMinutehigh[j]];        
            }     


            console.log("\loading "+id+" chart completed " );
             
            cb(stockData); 
    });    });
}

module.exports = {
    extractor: extractor,
   

}



