const express = require('express');
const app = express();
const getIextrading = require('./stockfilter');
const extractor = require('./stockHandler');
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
