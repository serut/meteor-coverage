/**
 * Usage: Meteor.sendCoverage(function(stats,err) {console.log(stats,err);});
 */
Meteor.sendCoverage = function (callback) {
    var coverageReport = {},
        stats = {SUCCESS: 0, FAILED: 0, TOTAL: 0},
        successCallback = function () {
            stats.SUCCESS++;
            if (stats.SUCCESS + stats.FAILED === stats.TOTAL) {
                callback(stats);
            }
        },
        errorCallback = function() {
            stats.FAILED++;
            if (stats.SUCCESS + stats.FAILED === stats.TOTAL) {
                callback(stats, arguments);
            }
        };
    if (global['__coverage__'] == undefined) {
        return callback(stats);
    }
    // Send each property alone
    for (var property in __coverage__) {
        if (__coverage__.hasOwnProperty(property)) {
            stats.TOTAL++;
            coverageReport = {};
            coverageReport[property] = __coverage__[property];
            $.ajax({
                method: 'POST',
                url: '/coverage/client',
                data: JSON.stringify(coverageReport),
                contentType: 'application/json; charset=UTF-8',
                processData: false,
                success: successCallback,
                error: errorCallback
            });
        }
    }
};

/**
* Usage: Meteor.exportCoverage(null, function(err) {console.log(err)})
*/
Meteor.exportCoverage = function (type, callback) {
    var url = type ? '/coverage/export/'+type : '/coverage/export';
    $.ajax({
        method: 'GET',
        url: url,
        success: function(data) {
            try {
                let result = JSON.parse(data);
                if (result.type === "success") {
                    return callback();
                }
            } catch (e) {
                return callback(e);
            }
            return callback("sdqf");
        },
        error: function() {
            callback(arguments);
        }
    });
};

/**
* Usage: Meteor.importCoverage(function(err) {console.log(err)})
*/
Meteor.importCoverage = function (callback) {
    $.ajax({
        method: 'GET',
        url: '/coverage/import',
        success: function(data) {
            try {
                let result = JSON.parse(data);
                if (result.type === "success") {
                    callback();
                }
            } catch (e) {
                callback(arguments);
            }
        },
        error: function() {
           callback(arguments);
        }
    });
};
