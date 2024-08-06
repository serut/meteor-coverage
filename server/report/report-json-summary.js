import Conf from './../context/conf';
import CoverageData from './../services/coverage-data';
import Core from './../services/core';
import ReportCommon from './report-common';
const ReportImpl = Npm.require('istanbul-reports');

export default class {
  constructor(res, type, options) {
    this.res = res;
    this.options = options;
    /* istanbul ignore next: ternary operator */
    this.options.verbose = Conf.IS_COVERAGE_VERBOSE ? true : false;
    this.report = ReportImpl.create(type, this.options);

    this.report.file = this.options.path;
    this.context = ReportCommon.getContext(this.report.file);
  }

  generate() {
    const coverage = Core.getCoverageObject();
    let childs = CoverageData.getLcovonlyReport(coverage);
    this.report.onStart(null, this.context);
    /* istanbul ignore else */
    this.res.set('Content-type', 'application/json');

    if (childs.length === 0) {
      this.res.status(500);
      return this.res.json({'type':'No coverage to export'});
    }
    this.writeFile(childs);
    this.res.json({ type: 'success' });
  }

  writeFile (childs) {
    for (let i = 0; i < childs.length; i++) {
      // Remove the COVERAGE_APP_FOLDER from the filepath
      try {
        childs[i].fileCoverage.data.path = childs[i].fileCoverage.data.path.replace(Conf.COVERAGE_APP_FOLDER, '');
      } catch {}
      this.report.onDetail(childs[i]);
    }
    ///Todo: not working
    //this.report.onSummary(childs);
    this.report.onEnd();
  }

}
