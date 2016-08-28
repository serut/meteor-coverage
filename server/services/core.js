import Conf from './../context/conf';
import path from 'path';
import fs from 'fs';
const istanbulAPI = Npm.require('istanbul-api');
const Coverage = istanbulAPI.libCoverage;

let mergeCoverageWith, importCoverage, getCoverageObject;

getCoverageObject = function () {
  global.__coverage__ = global.__coverage__ || {};
  return global.__coverage__;
};

setCoverageObject = function (obj) {
  global.__coverage__ = obj;
};

mergeCoverageWith = function (obj) {
  if (!obj) {
    return;
  }
  var coverage = getCoverageObject();
  var coverageMap = Coverage.createCoverageMap(coverage);
  coverageMap.addFileCoverage(obj);
  setCoverageObject(coverageMap.toJSON());
};


importCoverage = function (res, options = {}) {
  Log.info('import coverage');
  var filename = options.filename ? options.filename : 'report.json';
  var reportPath = path.join(Conf.COVERAGE_APP_FOLDER, Conf.COVERAGE_EXPORT_FOLDER, filename);
  fs.exists(reportPath, function (exists) {
    if (!exists) {
      throw 'report file not found: reportPath=' + reportPath + ' COVERAGE_APP_FOLDER=' + Conf.COVERAGE_APP_FOLDER;
    }
    fs.readFile(reportPath, 'utf8', function (err, fileContent) {
      if (err) {
        throw 'failed to read report file: ' + reportPath;
      }
      var coverageObj = JSON.parse(fileContent);
      for (var property in coverageObj) {
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
