import { $ } from 'meteor/jquery';
import { Meteor } from 'meteor/meteor';

var stats = {SUCCESS: 0, FAILED: 0, TOTAL: 0};
Meteor.getStats = function () {
  return stats;
};

Meteor.increaseSuccess = function () {
  stats.SUCCESS++;
};

Meteor.increaseFailures = function () {
  stats.FAILED++;
};

Meteor.increaseTotal = function () {
  stats.TOTAL++;
};

Meteor.getCoverageObject = function () {
  return global['__coverage__'];
};

Meteor.getCoverageReportObject = function (propertyKey, value) {
  var coverageReport = {};
  coverageReport[propertyKey] = value;

  return JSON.stringify(coverageReport);
};

/**
* Usage: Meteor.sendCoverage(function(stats,err) {console.log(stats,err);});
*/
Meteor.sendCoverage = function (callback) {
    var coverageReport = {},
        successCallback = function () {
            Meteor.increaseSuccess();
            var stats = Meteor.getStats();
            if (stats.SUCCESS + stats.FAILED === stats.TOTAL) {
                callback(stats);
            }
        },
        errorCallback = function() {
            Meteor.increaseFailures();
            var stats = Meteor.getStats();
            if (stats.SUCCESS + stats.FAILED === stats.TOTAL) {
                callback(stats, arguments);
            }
        };

    var globalCoverage = Meteor.getCoverageObject();
    if (!globalCoverage) {
        return callback(Meteor.getStats());
    }

    // Send each property alone
    for (var property in globalCoverage) {

        if (globalCoverage.hasOwnProperty(property)) {
            Meteor.increaseTotal();

            $.ajax({
                method: 'POST',
                url: '/coverage/client',
                data: Meteor.getCoverageReportObject(property, globalCoverage[property]),
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
                if (result.type !== "success") {
                  throw new Error('An unexpected error occurred while trying to export coverage data');
                }

                return callback();
            } catch (e) {
                return callback(e);
            }
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
                if (result.type !== "success") {
                  throw new Error('An unexpected error occurred while trying to import coverage data');
                }

                return callback();
            } catch (e) {
                callback(e, arguments);
            }
        },
        error: function() {
           callback(e, arguments);
        }
    });
};

export default Meteor;
