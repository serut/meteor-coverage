import { HTTP } from 'meteor/http';
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
  var coverageReport = {};

  var globalCoverage = Meteor.getCoverageObject();
  if (!globalCoverage) {
    return callback(Meteor.getStats());
  }

  // Send each property alone
  for (var property in globalCoverage) {
    /* istanbul ignore else */
    if (globalCoverage.hasOwnProperty(property)) {
      Meteor.increaseTotal();

      HTTP.call('POST', '/coverage/client', {
        content: Meteor.getCoverageReportObject(property, globalCoverage[property]),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8'
        }
      }, (error, res) => {
        if (error) {
          Meteor.increaseFailures();
        } else {
          Meteor.increaseSuccess();
        }

        var stats = Meteor.getStats();
        /* istanbul ignore else */
        if (stats.SUCCESS + stats.FAILED === stats.TOTAL) {
          if (stats.FAILED > 0) {
            // This is bullshit. Should not be done like that
            // Test runners test if the second params is a truth value, so let's use a number
            return callback(stats, stats.FAILED);
          }
          return callback(stats);
        }
      });
    }
  }
};
/**
* Usage: Meteor.exportCoverage(null, function(err) {console.log(err)})
*/
Meteor.exportCoverage = function (type, callback) {
  /* istanbul ignore next: ternary operator */
  var url = type ? '/coverage/export/'+type : '/coverage/export';
  HTTP.call('GET', url, {}, (error, res) => {
    if (error) {
      return callback('Error: '+JSON.stringify(arguments)+'. A server error occurred while trying to export coverage data');
    }

    try {
      let result = JSON.parse(res.content);
      /* istanbul ignore else */
      if (result.type !== 'success') {
        throw new Error('Error: '+JSON.stringify(arguments)+'. An unexpected error occurred while trying to export coverage data');
      }

      return callback();
    } catch (e) {
      return callback(e);
    }
  });
};

/**
* Usage: Meteor.importCoverage(function(err) {console.log(err)})
*/
Meteor.importCoverage = function (callback) {
  HTTP.call('GET', '/coverage/import', {}, (error, res) => {
    if (error) {
      return callback(error, [error]);
    }

    try {
      let result = JSON.parse(res.content);
      /* istanbul ignore else */
      if (result.type !== 'success') {
        throw new Error('Error: '+JSON.stringify(arguments)+'. An unexpected error occurred while trying to import coverage data');
      }

      return callback();
    } catch (e) {
      callback(e, [res]);
    }
  });
};

export default Meteor;
