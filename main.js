const express = require('express');
const app = express();
const getIextrading = require('./stockfilter');
const extractor = require('./stockHandler');
const tda = require('./tda');

//const temp = require('./temp');
//const history = require('./historySaveModule');
const bodyParser = require('body-parser');


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    //console.log(getIextrading.getIextrading);
    getIextrading.getIextrading(function (stocks) {
        console.log('rendering the page')
        res.render('main', { allStocks: stocks }, console.log("page is loaded"));
    })

});

app.get('/key', function (req, res) {

    // if we don't have the key in query string - that means we just opened in
    if (typeof req.query.code === "undefined") {
        var accessKey = tda.getAccessKey();
        res.render('key', { key: accessKey, require });
        return;
    }

    // requesting the access key
    tda.requestToken(req.query.code, (error, accessKey) => {
        if (error == null) {
            res.redirect('/key')
        } else {
            res.render('key', { error: error.error, statusCode: error.statusCode, body: error.body, require });
        }
    })
});

app.get('/favicon.ico', (req, res) => res.status(204));

app.get('/stockhandler/:id', (req, res) => {
    console.log(req.body);
    extractor.extractor(function (callback) {


        res.render('template', {
            stockData: callback,
            fiveMinuteChart: callback,
            alertCounter: callback,
            historyDate: req.body,
        },
            console.log("page loaded " + (typeof (callback) !== 'undefined' ? '100%' : 'false')));

    }, req.params.id);


});
/* app.get('/history', (req, res) => {
    history.history(function(callback){
       
        res.send(callback);
        res.end();

    })
 


}); */

app.post('/stockhandler/:id', (req, res) => {

console.log(typeof(req.body.date));
    extractor.extractor(function (callback) {

        res.render('template', {
            stockData: callback,
            fiveMinuteChart: callback,
            alertCounter: callback,
            historyDate: req.body
        },
            console.log("page loaded " + (typeof (callback) !== 'undefined' ? '100%' : 'false')));

    }, req.params.id, req.body);

})
/* app.get('/stockhandler', (req, res) => {
    temp.temp(function(callback){
       
        res.send(callback);
        res.end();

    })
 


}); */




app.listen(port, console.log('server online'));	
