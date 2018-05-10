import {assert} from 'chai';
import meteorCoverageApi from 'meteor/lmieulet:meteor-coverage';

const CoverageData = meteorCoverageApi.CoverageData;
const Router = meteorCoverageApi.Router;
const SourceMap = meteorCoverageApi.SourceMap;
const ReportService = meteorCoverageApi.ReportService;
const Conf = meteorCoverageApi.Conf;


describe('meteor coverage', function () {

  it('is importeable in es6', function () {
    assert.isNotNull(CoverageData);
    assert.isNotNull(Router);
    assert.isNotNull(SourceMap);
    assert.isNotNull(ReportService);
    assert.isNotNull(Conf);
  });
  describe('check if coverage is active', function () {
    it ('for CoverageData', function () {
      assert.isNotNull(CoverageData.isAccepted);
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
