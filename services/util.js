var util = {};

util.sqlDateString = function (date) {
    return date.toISOString().slice(0, 10);
}

module.exports = util;