import Conf from './../context/conf';
import CoverageData from './../services/coverage-data';
import Core from './../services/core';
import ReportCommon from './report-common';

const ReportImpl = Npm.require('istanbul-reports');

export default class {
  constructor(res, options) {
    this.res = res;
    this.options = options;
    this.report = ReportImpl.create(type, this.options);
    this.report.file = this.options.path;
    this.context = ReportCommon.getContext(this.report.file);
  }

  generate() {
    let coverage = Core.getCoverageObject();
    var childs = CoverageData.getLcovonlyReport(coverage);

    if (childs.length === 0) {
      this.res.set('Content-type', 'text/plain');
      this.res.status(500);
      return this.res.json({ type: 'No coverage to export' });
    }

    this.writeFile(childs);
    this.res.json({ type: 'success' });
  }

  writeFile (childs) {
    for (var i = 0; i < childs.length; i++) {
      // Remove the COVERAGE_APP_FOLDER from the filepath
      try {
        childs[i].fileCoverage.data.path = childs[i].fileCoverage.data.path.replace(Conf.COVERAGE_APP_FOLDER, '');
      } catch {}
    }
    this.report.onStart(childs, this.context);
  }

}
