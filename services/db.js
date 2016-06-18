var express = require('express'),
    sql = require('mssql');
/**
 * global db connection object
 */
db = {};
/**
 * DB Connection Configuration
 * @type {{user: string, password: string, server: string, database: string, port: number}}
 */
db.config = {
    user: 'action',
    password: 'action229',
    server: 'localhost', // You can use 'localhost\\instance' to connect to named instance
    database: 'ACTIONROAM',
    port: 1433
    //options: {
    //  encrypt: true // Use this if you're on Windows Azure
    //}
};

/**
 * Create DB Connection instance
 * @returns {{}}
 */
db.createConn = function () {
    var obj = {};
    obj.conn = new sql.Connection(this.config);
    obj.request = new sql.Request(obj.conn);

    return obj;
};

/**
 * Close DB connection instance
 * @param obj
 */
db.closeConn = function (obj) {
    obj.conn.close();
};

module.exports = db;