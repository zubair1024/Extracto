var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var util = require('./services/util');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


var ETLAssetUtilizationAnalysisJob = require('./services/ETLAssetUtilizationAnalysisJob'),
    now = new Date(),
    nextRun = new Date();

//Set the next run to the start of the next day
nextRun.setHours(24, 0, 0, 0);

//duration before midnight
var timeToNextRun = nextRun - new Date();

console.log(`The next run is sheduled to start in: ${timeToNextRun / 1000 / 60 / 60} hours`);

//Run Job(s)
setTimeout(function () {
    setInterval(function () {
        ETLAssetUtilizationAnalysisJob.init(util.sqlDateString(now), util.sqlDateString(nextRun));
    }, 86400000)
}, timeToNextRun);

//For testing
ETLAssetUtilizationAnalysisJob.init('2015-11-02', '2015-11-03');


module.exports = app;
