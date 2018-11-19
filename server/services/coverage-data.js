import Conf from './../context/conf';
import path from 'path';
import fs from 'fs';

const Coverage = Npm.require('istanbul-lib-coverage');
const Report = Npm.require('istanbul-lib-report');

export default CoverageData = {
  getReport: function (coverage) {
    // QUICKFIX FOR PACKAGES TESTS
    if (Meteor.isPackageTest) {
      if (Package["lmieulet:meteor-packages-coverage"] && Package["lmieulet:meteor-packages-coverage"].default && Package["lmieulet:meteor-packages-coverage"].default.CoverageData) {
        // Ask for lmieulet:meteor-packages-coverage coverage report, as we are in package test
        return Package["lmieulet:meteor-packages-coverage"].default.CoverageData.getReport(coverage);
      }
      throw new Error("lmieulet:meteor-packages-coverage not found. Just add this server dependency in Package.onTest in your package.js")
    }
    // Used for meteor apps using babel
    return Coverage.createCoverageMap(coverage);
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
