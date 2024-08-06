import Conf from './../context/conf';
import ReportCommon from './report-common';
import IstanbulGenericReporter from './report-generic';
import path from 'node:path';
import Log from '../context/log';
const remapIstanbul = Npm.require('remap-istanbul');
const MemoryStore = Npm.require('istanbul/lib/store/memory');

export default class {
  constructor(res, type, options) {
    this.res = res;

    // Common options
    this.options = options;

    // JSON report options
    this.pathJSON = path.join(this.options.path, 'summary.json');

    // remap-istanbul options
    this.remapFolder = path.join(Conf.COVERAGE_EXPORT_FOLDER, '.remap');
    this.remapPath = path.join(Conf.COVERAGE_APP_FOLDER, this.remapFolder);
  }

  generateJSONReport() {
    const jsonOptions = Object.assign({}, this.options, {path: this.pathJSON});
    let jsonReport = new IstanbulGenericReporter(this.res, 'json', jsonOptions);
    jsonReport.generate();
  }

  getFilePath(filename) {
    return path.join(this.remapFolder, filename);
  }

  generate() {
    // We cannot rely on a previous coverage analysis JSON report,
    // so we force its generation here before remapping
    this.generateJSONReport();

    const cwd = process.cwd();
    process.chdir(Conf.COVERAGE_APP_FOLDER);

    // Create output directory if not exists
    ReportCommon.checkDirectory(this.remapPath);

    let reports = {}, allReports = {
      'html': this.remapPath,
      'clover': this.getFilePath('clover.xml'),
      'cobertura': this.getFilePath('cobertura.xml'),
      'teamcity': this.getFilePath('teamcity.log'),
      'text-summary': this.getFilePath('summary.txt'),
      'text': this.getFilePath('report.txt'),
      'lcovonly': this.getFilePath('lcov.info'),
      'json-summary': this.getFilePath('summary.json'),
      'json': this.getFilePath('report.json')
    };

    Conf.remapFormat.forEach((type) => reports[type] = allReports[type]);
    const res = this.res;
    this.remapWrapper(this.pathJSON, reports, this.options)
      .catch(e => {
        Log.error(e);
        res.status(500);
        res.send(e.message);
      })
      .finally(() => {
      // Restore previous working directory
        process.chdir(cwd);
      });
  }

  remapWrapper(sources, reports, options) {
    let sourceStore = new MemoryStore();
    const loaded = remapIstanbul.loadCoverage(sources);
    let collector = remapIstanbul.remap(loaded, {
      sources: sourceStore,
      warn: function() {}
    });

    /* istanbul ignore else */
    if (!Object.keys(sourceStore.map).length) {
      sourceStore = undefined;
    }

    let p = Object.keys(reports).map((reportType) => {
      let reportOptions = Object.assign({}, this.options, {verbose: reportType !== 'html'});
      return remapIstanbul.writeReport(collector, reportType, reportOptions, reports[reportType], sourceStore);
    });

    return Promise.all(p);
  }
}
