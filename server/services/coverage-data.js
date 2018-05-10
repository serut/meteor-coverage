import Conf from './../context/conf';
import path from 'path';
import fs from 'fs';

const Coverage = Npm.require('istanbul-lib-coverage');
const Report = Npm.require('istanbul-lib-report');

export default CoverageData = {
  getReport: function (coverage) {
    let coverageMap = Coverage.createCoverageMap(coverage);
    coverageMap = SourceMap.lib.transformCoverage(coverageMap).map;
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
