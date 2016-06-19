Tinytest.addAsync(
    'meteor-coverage - send client coverage',
    function (test, next) {
        Meteor.sendCoverage(
            function(stats,err) {
                test.isTrue(stats.TOTAL > 0, "no client coverage");
                test.isTrue(stats.SUCCESS > 0, "none of the client covreage have been saved");
                test.isTrue(stats.FAILED === 0, "an export failed");
                next();
            }
        );
    }
);
Tinytest.addAsync(
    'meteor-coverage - export coverage',
    function (test, next) {
        Meteor.exportCoverage(
            'coverage',
            function(err) {
                test.isUndefined(err, "failed to export coverage");
                next();
            }
        );
    }
);
Tinytest.addAsync(
    'meteor-coverage - import coverage',
    function (test, next) {
        Meteor.importCoverage(
            function(err) {
                test.isUndefined(err, "failed to import coverage");
                next();
            }
        );
    }
);

Tinytest.addAsync(
    'meteor-coverage - export lcovonly',
    function (test, next) {
        Meteor.exportCoverage(
            'lcovonly',
            function(err) {
                test.isUndefined(err, "failed to export lcovonly");
                next();
            }
        );
    }
);
