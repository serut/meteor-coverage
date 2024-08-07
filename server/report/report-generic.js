import CoverageData from './../services/coverage-data';
import Core from './../services/core';
import ReportCommon from './report-common';
import Conf from '../context/conf';
import Log from '../context/log';
import { Response } from '../services/response';

const ReportImpl = Npm.require('istanbul-reports');
  
/**
 * Used by type lcovonly and json
 * create the corresponding file using istanbul api
 * @type {any}
 */
export default class {
  constructor(res, type, options) {
    this.res = res;
    this.options = options;
    this.report = ReportImpl.create(type, this.options);
    this.report.file = this.options.path;
    this.context = ReportCommon.getContext(this.report.file);
  }

  generate() {
    const coverage = Core.getCoverageObject();
    let children = CoverageData.getLcovonlyReport(coverage);
    this.report.onStart(null, this.context);
    /* istanbul ignore else */
    if (children.length === 0) {
      return Response.send({
        res: this.res,
        status: 500,
        type: 'application/json',
        json: {'type':'No coverage to export'}
      });
    }

    this.writeFile(children);
    Response.send({
      res: this.res,
      type: 'application/json',
      json: { type: 'success' }
    });
  }

  writeFile(children) {
    for (let i = 0; i < children.length; i++) {
      // Remove the COVERAGE_APP_FOLDER from the filepath
      try {
        children[i].fileCoverage.data.path = children[i].fileCoverage.data.path.replace(Conf.COVERAGE_APP_FOLDER, '');
      } catch (e) {
        Log.error(e);
      }
      this.report.onDetail(children[i]);
    }
    this.report.onEnd();
  }
}
