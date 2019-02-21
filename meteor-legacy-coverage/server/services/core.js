import Conf from './../context/conf';
import path from 'path';
import fs from 'fs';
const Coverage = Npm.require('istanbul-lib-coverage');

let mergeCoverageWith, importCoverage, getCoverageObject;

getCoverageObject = function () {
  /* istanbul ignore next: default assignment */
  global.__coverage__ = global.__coverage__ || {};
  return global.__coverage__;
};

setCoverageObject = function (obj) {
  global.__coverage__ = obj;
};

mergeCoverageWith = function (obj) {
  /* istanbul ignore else */
  if (!obj) {
    return;
  }
  var coverage = getCoverageObject();
  var coverageMap = Coverage.createCoverageMap(coverage);
  coverageMap.addFileCoverage(obj);
  setCoverageObject(coverageMap.toJSON());
};


/* istanbul ignore next: default assignment */
importCoverage = function (res, options = {}) {
  Log.info('import coverage');
  /* istanbul ignore next: ternary operator */
  const filename = options.filename ? options.filename : 'report.json';
  const reportPath = path.join(Conf.COVERAGE_APP_FOLDER, Conf.COVERAGE_EXPORT_FOLDER, filename);
  fs.exists(reportPath, function (exists) {
    /* istanbul ignore else */
    if (!exists) {
      res.end(JSON.stringify({ type: 'failed', message: 'report file not found: reportPath=' + reportPath + ' COVERAGE_APP_FOLDER=' + Conf.COVERAGE_APP_FOLDER }));
      return;
    }
    fs.readFile(reportPath, 'utf8', function (err, fileContent) {
      /* istanbul ignore else */
      if (err) {
        res.end(JSON.stringify({ type: 'failed', message: 'failed to read report file: ' + reportPath }));
        return;
      }
      let coverageObj = JSON.parse(fileContent);
      for (let property in coverageObj) {
        /* istanbul ignore else */
        if (coverageObj.hasOwnProperty(property)) {
          Core.mergeCoverageWith(coverageObj[property]);
        }
      }
      res.end('{"type":"success"}');
    });
  });
};
export default Core = {
  mergeCoverageWith,
  importCoverage,
  getCoverageObject
};
