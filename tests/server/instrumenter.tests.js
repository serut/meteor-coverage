
Tinytest.add(
    'meteor-coverage - testing component Instrumenter checkIfAutorised',
    function (test) {
        test.isNotNull(Package['lmieulet:meteor-coverage'])
        test.isNotNull(Package['lmieulet:meteor-coverage'].default)
        test.isNotNull(Package['lmieulet:meteor-coverage'].default.Instrumenter)

        var Instrumenter = Package['lmieulet:meteor-coverage'].default.Instrumenter,
            conf = ['.*/tests/.*.js'];
        // Excluded
        test.isFalse(Instrumenter.checkIfAutorised(conf, '/home/travis/build/serut/meteor-coverage/packages/lmieulet:meteor-coverage/tests/methods.js'));

        // Client coverage
        test.isTrue(Instrumenter.checkIfAutorised(conf, '/home/travis/build/serut/meteor-coverage/packages/meteor-coverage/client/methods.js'));

        // Server coverage
        test.isTrue(Instrumenter.checkIfAutorised(conf, '/home/travis/build/serut/meteor-coverage/packages/meteor-coverage/server/conf.js'));

    }
);
