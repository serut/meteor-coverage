import {assert} from 'chai';
import meteorCoverageApi from 'meteor/lmieulet:meteor-coverage';

const CoverageData = meteorCoverageApi.CoverageData;
const Router = meteorCoverageApi.Router;
const ReportService = meteorCoverageApi.ReportService;
const Conf = meteorCoverageApi.Conf;


describe('meteor coverage', function () {

  it('is importeable in es6', function () {
    assert.isNotNull(CoverageData);
    assert.isNotNull(Router);
    assert.isNotNull(ReportService);
    assert.isNotNull(Conf);
  });
});
