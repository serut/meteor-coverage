import {assert} from 'meteor/practicalmeteor:chai';
import MeteorCoverage from 'meteor/lmieulet:meteor-coverage';
const {Instrumenter, CoverageData} = MeteorCoverage;

describe('meteor coverage', function () {

  it('testing component Instrumenter shouldIgnore', function () {
    assert.isNotNull(MeteorCoverage);
    assert.isNotNull(Instrumenter);
    assert.isNotNull(CoverageData);
  });
  describe('testing Instrumenter', function () {

    describe('shouldIgnore', function () {
      it('accept minified tests files', function () {
        assert.isFalse(Instrumenter.shouldIgnore('/home/travis/build/serut/meteor-coverage/server/local-test_lmieulet_meteor-coverage.js', true));
        assert.isFalse(Instrumenter.shouldIgnore('/home/travis/build/serut/app/client/imports/lib/local-test_lmieulet_meteor-coverage.js', false));
      });

      it('ignore client tests files', function () {
        // Ignored from client
        assert.isTrue(Instrumenter.shouldIgnore('/home/travis/build/serut/app/client/imports/tests/methods.js', false));
        assert.isTrue(Instrumenter.shouldIgnore('/home/travis/build/serut/meteor-coverage/packages/meteor-coverage/client/tests/methods.js', false));
      });

      it('ignore server tests files ', function () {
        // Ignored from server
        assert.isTrue(Instrumenter.shouldIgnore('/home/travis/build/serut/app/server/lib/code/my.test.js', true));
        assert.isTrue(Instrumenter.shouldIgnore('/home/travis/build/serut/meteor-coverage/packages/meteor-coverage/server/tests/test.js', true));
      });
    });
  });

  it('testing component CoverageData isAccepted', function () {
    assert.isFalse(CoverageData.isAccepted('/packages/callback-hook.js'));
    assert.isFalse(CoverageData.isAccepted('../web.browser/packages/ddp-server.js'));
    assert.isFalse(CoverageData.isAccepted('/home/travis/build/serut/app/client/imports/tests/methods.js'));
    assert.isFalse(CoverageData.isAccepted('/home/travis/build/serut/meteor-coverage/packages/meteor-coverage/client/tests/methods.js'));
    assert.isFalse(CoverageData.isAccepted('/home/travis/build/serut/app/server/lib/tests/methods.js'));
    assert.isFalse(CoverageData.isAccepted('/home/travis/build/serut/meteor-coverage/packages/meteor-coverage/server/tests/test.js'));
  });
});
