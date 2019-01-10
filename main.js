const express = require('express');
const app = express();
const getIextrading = require('./stockfilter');
const extractor = require('./stockHandler');

app.set('view engine', 'ejs');

const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
    //console.log(getIextrading.getIextrading);
    getIextrading.getIextrading(function (stocks) {
        console.log('rendering the page')
        res.render('main', { allStocks: stocks }, console.log("page is loaded"));
    })

});

app.get('/:id', (req, res) => {

    extractor.extractor(function (callback) {
        
     res.render('template', { stockData: callback },  
     console.log("page loaded " + (typeof (callback) !== 'undefined' ? '100%' : 'false')));

       
    }, req.params.id);


});



app.listen(port, console.log('server online'));	