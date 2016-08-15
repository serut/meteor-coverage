import Conf from '../context/conf';
import fs from 'fs';
import path from 'path';

export default class {
  constructor(res, options) {
    this.res = res;
    this.options = options;
    this.options.filename = this.options.path;
  }

  generate() {
    let coverage = Core.getCoverageObject();
    var coverageReport = JSON.stringify(coverage),
      reportPath = this.options.path;
    let instance = this;
    fs.writeFile(reportPath, coverageReport, function (err) {
      if (err) {
        throw 'failed to write report file: ' + reportPath;
      }
      instance.res.end('{"type":"success"}');
    });

  }
}