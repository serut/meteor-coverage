import MeteorCoverage from 'meteor/lmieulet:meteor-coverage';
import { assert } from 'meteor/practicalmeteor:chai';

describe('meteor coverage', function () {
    it('testing component Instrumenter checkIfAutorised', function () {
        assert.isNotNull(MeteorCoverage)
        assert.isNotNull(MeteorCoverage.Instrumenter)

        var Instrumenter = MeteorCoverage.Instrumenter,
            conf = ['.*/tests/.*.js'];
        // Excluded
        assert.isFalse(Instrumenter.checkIfAutorised(conf, '/home/travis/build/serut/meteor-coverage/packages/lmieulet:meteor-coverage/tests/methods.js'));

        // Client coverage
        assert.isTrue(Instrumenter.checkIfAutorised(conf, '/home/travis/build/serut/meteor-coverage/packages/meteor-coverage/client/methods.js'));

        // Server coverage
        assert.isTrue(Instrumenter.checkIfAutorised(conf, '/home/travis/build/serut/meteor-coverage/packages/meteor-coverage/server/conf.js'));

    })
    it('testing component CoverageData isAccepted', function () {
        var CoverageData = MeteorCoverage.CoverageData;
        assert.isFalse(CoverageData.isAccepted('/packages/callback-hook.js'));
        assert.isFalse(CoverageData.isAccepted('../web.browser/packages/ddp-server.js'));
    })
})
