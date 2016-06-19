
Tinytest.add(
    'meteor-coverage - testing component Instrumenter checkIfAutorised',
    function (test) {
        var Instrumenter = Package['lmieulet:meteor-coverage'].MeteorCoverage.Instrumenter,
            conf = ['.*/tests/.*.js']
        // Excluded
        test.isFalse(Instrumenter.checkIfAutorised(conf, '/home/travis/build/serut/meteor-coverage/packages/lmieulet:meteor-coverage/tests/methods.js'));

        // Client coverage
        test.isTrue(Instrumenter.checkIfAutorised(conf, '/home/travis/build/serut/meteor-coverage/packages/meteor-coverage/client/methods.js'));

        // Server coverage
        test.isTrue(Instrumenter.checkIfAutorised(conf, '/home/travis/build/serut/meteor-coverage/packages/meteor-coverage/server/conf.js'));

    }
);
