import Conf from './../context/conf';
import path from 'node:path';
import Log from '../context/log';

const Coverage = Npm.require('istanbul-lib-coverage');
const Report = Npm.require('istanbul-lib-report');

const CoverageData = {
  getReport: function (coverage) {
    if (Package['lmieulet:meteor-legacy-coverage'] && Package['lmieulet:meteor-legacy-coverage'].default && Package['lmieulet:meteor-legacy-coverage'].default.CoverageData) {
      // Retrieve the coverage report from the other lib, as we used the legacy system
      return Package['lmieulet:meteor-legacy-coverage'].default.CoverageData.getReport(coverage);
    } else if (Meteor.isPackageTest) {
      // MANDATORY FOR PACKAGES TESTS
      throw new Error('lmieulet:meteor-legacy-coverage not found. Just add this server dependency in Package.onTest in your package.js');
    }
    // Used for meteor apps that relies on babel
    return Coverage.createCoverageMap(coverage);
  },
  getFileReport: function (coverage, filePath) {
    Log.info('get gile report');
    const coverageMap = this.getReport(coverage);
    const node = Report.summarizers.flat(coverageMap);
    const children = node.getRoot().getChildren();
    let child;
    for (let i = 0; i < children.length; i++) {
      /* istanbul ignore else */
      if (children[i].getRelativeName() === filePath) {
        child = children[i];
        // fix the path if possible
        if (child && child.fileCoverage && 
          child.fileCoverage.data && child.fileCoverage.data.path &&
          child.fileCoverage.data.path.indexOf(Conf.COVERAGE_APP_FOLDER)) {
          // add the folder in the path if not present
          child.fileCoverage.data.path = path.join(Conf.COVERAGE_APP_FOLDER, child.fileCoverage.data.path);
        }
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
