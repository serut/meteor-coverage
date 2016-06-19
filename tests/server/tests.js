Tinytest.add(
    'meteor-coverage - testing component CoverageData isAccepted',
    function (test) {
        var CoverageData = Package['lmieulet:meteor-coverage'].MeteorCoverage.CoverageData;
        test.isFalse(CoverageData.isAccepted('/packages/callback-hook.js'));
        test.isFalse(CoverageData.isAccepted('../web.browser/packages/ddp-server.js'));
    }
);
