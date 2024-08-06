import Conf from './../context/conf';
import Instrumenter from './instrumenter';
import SourceMap from './source-map';
import fs from 'node:fs';
import Log from '../context/log';

const Coverage = Npm.require('istanbul-lib-coverage');
const Report = Npm.require('istanbul-lib-report');

const CoverageData = {
  filterCoverageReport: function (report) {
    /* istanbul ignore else */
    if (!report.data) {
      throw 'Invalid report';
    }
    let newData = {};
    for (let property in report.data) {
      const acceptStatus = this.isAccepted(property);
      if (acceptStatus === true) {
        Log.info('added', property);
        newData[property] = report.data[property];
      } else if (acceptStatus !== 'should ignore') {
        Log.info('isRefused', acceptStatus);
      }
    }
    report.data = newData;
    return report;
  },
  isAccepted: function (filename) {
    // Check if the file was also inside a .map
    /* istanbul ignore else */
    if (filename.indexOf(Conf.COVERAGE_APP_FOLDER) < 0) {
      return 'not in app folder';
    }

    let isAServerSideFile = filename.indexOf('client') === -1 && filename.indexOf('web.browser') === -1;
    /* istanbul ignore else */
    if (Instrumenter.shouldIgnore(filename, isAServerSideFile)) {
      return 'should ignore';
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
      return 'html template transformed into js file';
    }
    /* istanbul ignore else */
    if (filename.indexOf('node_modules') > 0) {
      // this is a browser file?
      return 'is node_modules file';
    }

    return true;
  },
  getReport: function (coverage) {
    let coverageMap = Coverage.createCoverageMap(coverage);
    const rawMap = SourceMap.lib.transformCoverage(coverageMap);
    coverageMap = rawMap.map;
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

export default CoverageData;