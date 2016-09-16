import Conf from './../context/conf';
import Instrumenter from './instrumenter';
import path from 'path';
import fs from 'fs';

const istanbulAPI = Npm.require('istanbul-api');
const Report = istanbulAPI.libReport;
const Coverage = istanbulAPI.libCoverage;

export default CoverageData = {
  filterCoverageReport: function (report) {
    if (!report.data) {
      throw 'Invalid report';
    }
    var newData = {};
    for (var property in report.data) {
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
    if (filename.indexOf(Conf.COVERAGE_APP_FOLDER) < 0) {
      return false;
    }

    let isAServerSideFile = filename.indexOf('client') === -1 && filename.indexOf('web.browser') === -1;
    if (Instrumenter.shouldIgnore(filename, isAServerSideFile)) {
      return false;
    }

    if (filename.indexOf('packages/') > 0) {
      Log.time('read access ' + filename);
      const isExist = fs.existsSync(filename);
      Log.timeEnd('read access ' + filename);
      if (isExist) {
        // Internal package
        return true;
      }
    }
    if (filename.indexOf('client/') > 0 && filename.indexOf('template.') > 0) {
      if (fs.existsSync(filename)) {
        // some file
        return true;
      }
      // this is a html template transformed into js file
      return false;
    }
    if (filename.indexOf('node_modules') > 0) {
      // this is a browser file?
      return false;
    }

    return true;
  },
  getReport: function (coverage) {
    var coverageMap = Coverage.createCoverageMap(coverage);
    coverageMap = SourceMap.lib.transformCoverage(coverageMap).map;
    coverageMap = this.filterCoverageReport(coverageMap);
    return coverageMap;
  },
  getFileReport: function (coverage, filePath) {
    var coverageMap = this.getReport(coverage);
    var node = Report.summarizers.flat(coverageMap);
    var childs = node.getRoot().getChildren();
    var child = undefined;
    for (var i = 0; i < childs.length; i++) {
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
    var coverageMap = this.getReport(coverage);
    var node = Report.summarizers.flat(coverageMap);
    return node;
  }
};
