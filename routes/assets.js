var express = require('express');
var router = express.Router();
var db = require('../services/db'),
    statement = require('../services/templateStatements');

/* GET users listing. */
router.get('/', function (req, res, next) {
    var dbObj = db.createConn();
    dbObj.conn.connect(function (err) {
        if (err) {
            console.log(err);
        } else {
            return dbObj.request.query(statement.allAssets(), function (err, recordset) {
                if (err) {
                    console.log(err);
                } else {
                    //res.send(JSON.stringify(recordset));
                    res.send(recordset);
                }
            });
        }
    });
});

module.exports = router;
