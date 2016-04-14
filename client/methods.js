/**
 * Usage: Meteor.sendCoverage(function(stats) {console.log(stats);});
 */
Meteor.sendCoverage = function (callback) {
    var coverageReport = {},
        stats = {SUCCESS: 0, FAILED: 0, TOTAL: 0};
    if (!__coverage__) {
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
                success: function() {
                    stats.SUCCESS++;
                    if (stats.SUCCESS + stats.FAILED === stats.TOTAL) {
                        callback(stats);
                    }
                },
                error: function() {
                    stats.FAILED++;
                    if (stats.SUCCESS + stats.FAILED === stats.TOTAL) {
                        callback(stats, arguments);
                    }
                }
            })
        }
    }
}