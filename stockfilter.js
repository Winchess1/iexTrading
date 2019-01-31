const request = require('request');
const _ = require('underscore');

function getIextrading(cb) {
    var collection = [];

    const allStocks = {
        url: `https://api.iextrading.com/1.0/ref-data/symbols`,
        json: true,
        rejectUnauthorized: false,
        requestCert: true,
        agent: false
    }
    request(allStocks, function (error, response, body) {
        console.log("\tgrabbing and extracting the Stocks from API");
        collection.stock = _.map(
            _.filter(body, function (data) {
                return data['type'] !== 'et' && data['type'] !== 'N/A';
            }),

            function (data) {
                return data.symbol;
            });
        //console.log(collection.stock);    
        cb(collection.stock);

        console.log('\t\terror:', error); // Print the error if one occurred
        console.log('\t\tstatusCode:', response && response.statusCode);// Print the response status code if a response was received
    });

}

module.exports = {
    getIextrading: getIextrading
}
