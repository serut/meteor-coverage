import fs from 'node:fs';
import { Response } from '../services/response';

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
      /* istanbul ignore else */
      if (err) {
        Response.send({
          res: instance.res,
          json: { type: 'failed', message: 'failed to write report file: ' + reportPath }
        });
      } else {
        Response.send({
          res: instance.res,
          json: { type: 'success' }
        });
      }
    });
  }
}
