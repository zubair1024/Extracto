/**
 * Created by zubair on 17-Jun-16.
 */
var etljob = {},
    db = require('./db'),
    statement = require('./templateStatements'),
    async = require('async');


/**
 * Job Initializeer (pre-requisites)
 * @param startTimestamp
 * @param endTimestamp
 */
etljob.init = function (startTimestamp, endTimestamp) {
    console.time('ETLAssetUtilizationAnalysisJob');
    var me = this,
        dbObj = db.createConn();
    dbObj.conn.connect(function (err) {
        if (err) {
            console.log(err);
        } else {
            me.run(dbObj, startTimestamp, endTimestamp);
        }
    });
}

/**
 * Start ETL Asset Utilization Analysis Job
 * @param dbObj
 * @param startTimestamp
 * @param endTimestamp
 */
etljob.run = function (dbObj, startTimestamp, endTimestamp) {
    var me = this;
    me.getAssets(dbObj, function (assets) {
        var promises = [];

        async.forEach(assets, function (asset, callback) {
            me.getIgnitionEvents(dbObj, asset.SYSID, startTimestamp, endTimestamp, function (events) {
                promises.push(new Promise(function (resolve, reject) {
                    me.calculateUtilization(dbObj, asset, events, startTimestamp, resolve);
                }));
                callback();
            });
        }, function (err) {
            Promise.all(promises).then(function (value) {
                console.log('Execution End');
                //Close connection
                dbObj.closeConn();
                console.timeEnd('ETLAssetUtilizationAnalysisJob');
            });
        });

        //assets.forEach(function (asset) {
        //    me.getIgnitionEvents(dbObj, asset.SYSID, startTimestamp, endTimestamp, function (events) {
        //        me.calculateUtilization(dbObj, asset, events, startTimestamp);
        //    });
        //});

    });
}

/**
 * Get all active assets
 * @param dbObj
 * @param callback
 */
etljob.getAssets = function (dbObj, callback) {
    dbObj.request.query(statement.allAssets(), function (err, recordset) {
        if (err) {
            console.log(err);
        } else {
            callback(recordset);
        }
    });
}

/**
 * Get Ignition events for each asset
 * @param dbObj
 * @param SYSID
 * @param startTimestamp
 * @param endTimestamp
 * @param callback
 */
etljob.getIgnitionEvents = function (dbObj, SYSID, startTimestamp, endTimestamp, callback) {
    dbObj.request.query(statement.ignitionEvents(SYSID, startTimestamp, endTimestamp), function (err, recordset) {
        if (err) {
            console.log(err);
        } else {
            callback(recordset);
        }
    });
}

/**
 * Main logic for asset utilization calculation
 * @param dbObj
 * @param asset
 * @param events
 * @param etlDate
 */

etljob.calculateUtilization = function (dbObj, asset, events, etlDate, resolve) {
    var utilizedDuration = 0,
        used = 0,
        monitoredStart = null,
        promise = new Promise(function (fulfilled, reject) {
        if (events.length > 0) {
            for (var i = 0; i < events.length; i++) {
                if (events[i].NAME == 'Ignition On') {
                    monitoredStart = events[i].EVENTTIME;
                } else {
                    if (monitoredStart) {
                        //Utilized time in seconds
                        utilizedDuration += (events[i].EVENTTIME - monitoredStart) / 1000;
                        used = utilizedDuration ? 1 : 0;
                        monitoredStart = null;
                    }
                }
            }
            etljob.checkUtilization(dbObj, asset, etlDate, function (flag) {
                if (flag) {
                    dbObj.request.query(statement.updateAssetUtilization(asset.SYSID, etlDate, utilizedDuration, used), function (err, recordset) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(`Successfully updated record for ${asset.NAME}: ${asset.SYSID},${etlDate},${utilizedDuration},${used}`);
                            fulfilled(asset.NAME);
                        }
                        console.timeEnd('ETLAssetUtilizationAnalysisJob');
                    });
                } else {
                    dbObj.request.query(statement.insertAssetUtilization(asset.SYSID, etlDate, utilizedDuration, used), function (err, recordset) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(`Successfully inserted record for ${asset.NAME}: ${asset.SYSID},${etlDate},${utilizedDuration},${used}`);
                            fulfilled(asset.NAME);
                        }
                        console.timeEnd('ETLAssetUtilizationAnalysisJob');
                    });
                }
            });
        }
    });
    promise.then(function (asset) {
        resolve();
    });
}

/**
 * Check for a pre-exisiting utilization value
 * @param dbObj
 * @param asset
 * @param etlDate
 * @param callback
 */
etljob.checkUtilization = function (dbObj, asset, etlDate, callback) {
    dbObj.request.query(statement.checkAssetUtilization(asset.SYSID, etlDate), function (err, recordset) {
        if (err) {
            console.log(err);
        } else {
            recordset.length > 0 ? callback(true) : callback(false);
        }
    });
}


module.exports = etljob;



