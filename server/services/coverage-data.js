import Conf from './../context/conf';
import Instrumenter from './instrumenter';
import path from 'path';
import fs from 'fs';

const Coverage = Npm.require('istanbul-lib-coverage');
const Report = Npm.require('istanbul-lib-report');

export default CoverageData = {
  filterCoverageReport: function (report) {
    /* istanbul ignore else */
    if (!report.data) {
      throw 'Invalid report';
    }
    let newData = {};
    for (let property in report.data) {
      /* istanbul ignore else */
      if (report.data.hasOwnProperty(property)) {
        if (this.isAccepted(property)) {
          newData[property] = report.data[property];
        } else {
          Log.info('isRefused', property);
        }
      }
    }
    report.data = newData;
    return report;
  },
  isAccepted: function (filename) {
    // Check if the file was also inside a .map
    /* istanbul ignore else */
    if (filename.indexOf(Conf.COVERAGE_APP_FOLDER) < 0) {
      return false;
    }

    let isAServerSideFile = filename.indexOf('client') === -1 && filename.indexOf('web.browser') === -1;
    /* istanbul ignore else */
    if (Instrumenter.shouldIgnore(filename, isAServerSideFile)) {
      return false;
    }

    /* istanbul ignore else */
    if (filename.indexOf('packages/') > 0) {
      Log.time('read access ' + filename);
      const isExist = fs.existsSync(filename);
      Log.timeEnd('read access ' + filename);
      /* istanbul ignore else */
      if (isExist) {
        // Internal package
        return true;
      }
    }
    /* istanbul ignore else */
    if (filename.indexOf('client/') > 0 && filename.indexOf('template.') > 0) {
      /* istanbul ignore else */
      if (fs.existsSync(filename)) {
        // some file
        return true;
      }
      // this is a html template transformed into js file
      return false;
    }
    /* istanbul ignore else */
    if (filename.indexOf('node_modules') > 0) {
      // this is a browser file?
      return false;
    }

    return true;
  },
  getReport: function (coverage) {
    let coverageMap = Coverage.createCoverageMap(coverage);
    coverageMap = SourceMap.lib.transformCoverage(coverageMap).map;
    coverageMap = this.filterCoverageReport(coverageMap);
    return coverageMap;
  },
  getFileReport: function (coverage, filePath) {
    const coverageMap = this.getReport(coverage);
    const node = Report.summarizers.flat(coverageMap);
    const childs = node.getRoot().getChildren();
    let child;
    for (let i = 0; i < childs.length; i++) {
      /* istanbul ignore else */
      if (childs[i].getRelativeName() === filePath) {
        child = childs[i];
      }
    }
    return child;
  },
  getTreeReport: function (coverage) {
    return this.getNodeReport(coverage).getRoot();
  },
  getLcovonlyReport: function (coverage) {
    return this.getTreeReport(coverage).getChildren();
  },
  getNodeReport: function (coverage) {
    const coverageMap = this.getReport(coverage);
    return Report.summarizers.flat(coverageMap);
  }
};
