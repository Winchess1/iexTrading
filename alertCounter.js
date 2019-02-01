const express = require('express');
const app = express();
const extractor = require('./stockHandler');

var alertCounter = [];
var counter = 0;

extractor.extractor(function (callback) {
    for (i = 0,k=0; i < callback.fiveMinutelow.length; i++) {
        for (j = i+1; j < callback.fiveMinutelow.length; j++) {
            if (callback.fiveMinutelow[j]!=undefined && callback.fiveMinutelow[i]!=undefined){
            if (callback.fiveMinutelow[i] == callback.fiveMinutelow[j]) {                
                counter++;              
            }else { 
                if(counter>2){
                   
                    alertCounter[k] = callback.fiveMinute[i];
                    
                    k++;
                }
                 counter = 0;
                 i=j; 
                 break;  
                }
        }
    }


    };

module.exports.alertCounter = alertCounter;
});

