import Conf from './../context/conf';
import Instrumenter from './instrumenter';
import path from 'path';
import fs from 'fs';

import * as IstanbulApi from 'istanbul-api';
const Report = IstanbulApi.libReport;
const Coverage = IstanbulApi.libCoverage;

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
      if (Meteor.isPackageTest) {
        // Special case when it is a package-test run
        // check file is located in the root directory and not the in a package directory
        // this algorithm may autorise some files because a file has the same name
        var regexFilepath = filename.match(/.*packages\/([a-zA-Z\-\_\:]+)\/(.*)/);
        if (regexFilepath && regexFilepath.length > 1) {

          // Remove author name in the path if there is
          let packageName = regexFilepath[1];
          const filepath = regexFilepath[2];
          if (packageName.indexOf(':') > 0) {
            packageName = packageName.split(':')[1];
          }
          // meteor test-packages inside a meteor app
          if (fs.existsSync(path.join(Conf.COVERAGE_APP_FOLDER, 'packages', packageName, filepath))) {
            return true;
          }
          // meteor test-packages inside the package
          if (fs.existsSync(path.join(Conf.COVERAGE_APP_FOLDER, filepath))) {
            return true;
          }
        }

        // You don't have the source of this package file in your workspace
        return false;
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
