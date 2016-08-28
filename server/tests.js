import {assert} from 'meteor/practicalmeteor:chai';

import meteorCoverageApi from 'meteor/lmieulet:meteor-coverage';

const Instrumenter = meteorCoverageApi.Instrumenter;
const CoverageData = meteorCoverageApi.CoverageData;
const Router = meteorCoverageApi.Router;
const SourceMap = meteorCoverageApi.SourceMap;
const ReportService = meteorCoverageApi.ReportService;
const Conf = meteorCoverageApi.Conf;


describe('meteor coverage', function () {

  it('is importeable in es6', function () {
    assert.isNotNull(Instrumenter);
    assert.isNotNull(CoverageData);
    assert.isNotNull(Router);
    assert.isNotNull(SourceMap);
    assert.isNotNull(ReportService);
    assert.isNotNull(Conf);
  });
  describe('check if coverage is active', function () {
    it('for Instrumenter', function () {
      assert.isNotNull(Instrumenter.hookLoader);
      assert.isNotNull(Instrumenter.instrumentJs);
      assert.isNotNull(Instrumenter.shouldIgnore);
      assert.isNotNull(Instrumenter.fileMatch);
      assert.isNotNull(Instrumenter.shallInstrumentClientScript);
      assert.isNotNull(Instrumenter.shallInstrumentServerScript);
    });
    it ('for CoverageData', function () {
      assert.isNotNull(CoverageData.isAccepted);
    });
  });
  describe('check Instrumenter', function () {

    describe('test the filter shouldIgnore', function () {
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

  it('CoverageData isAccepted', function () {
    assert.isFalse(CoverageData.isAccepted('/packages/callback-hook.js'));
    assert.isFalse(CoverageData.isAccepted('../web.browser/packages/ddp-server.js'));
    assert.isFalse(CoverageData.isAccepted('/home/travis/build/serut/app/client/imports/tests/methods.js'));
    assert.isFalse(CoverageData.isAccepted('/home/travis/build/serut/meteor-coverage/packages/meteor-coverage/client/tests/methods.js'));
    assert.isFalse(CoverageData.isAccepted('/home/travis/build/serut/app/server/lib/tests/methods.js'));
    assert.isFalse(CoverageData.isAccepted('/home/travis/build/serut/meteor-coverage/packages/meteor-coverage/server/tests/test.js'));
  });
});
