import Conf from '../context/conf';
import Log from './../context/log';
import ReportCommon from './report-common';
import IstanbulGenericReporter from './report-generic';
import path from 'path';
const remapIstanbul = Npm.require('remap-istanbul');
const MemoryStore = Npm.require('istanbul/lib/store/memory');


export default class {
  constructor(res, type, options) {
    this.res = res;

    // Common options
    this.options = options;
    if (!this.options.hasOwnProperty('verbose')) {
      this.options.verbose = Conf.IS_COVERAGE_VERBOSE ? true : false;
    }

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

  generate() {
    // We cannot rely on a previous coverage analysis JSON report,
    // so we force its generation here before remapping
    this.generateJSONReport();

    const cwd = process.cwd();
    process.chdir(Conf.COVERAGE_APP_FOLDER);

    // Create output directory if not exists
    ReportCommon.checkDirectory(this.remapPath);

    let addFile = (filename) => path.join(this.remapFolder, filename);
    let reports = {}, allReports = {
        'html': this.remapPath,
        'clover': addFile('clover.xml'),
        'cobertura': addFile('cobertura.xml'),
        'teamcity': addFile('teamcity.log'),
        'text-summary': addFile('summary.txt'),
        'text': addFile('report.txt'),
        'lcovonly': addFile('lcov.info'),
        'json-summary': addFile('summary.json'),
        'json': addFile('report.json')
      };
    Conf.remap.format.forEach((type) => reports[type] = allReports[type]);
    this.remapWrapper(this.pathJSON, reports, this.options).await();
    this.res.end('{"type":"success"}');

    // Restore previous working directory
    process.chdir(cwd);
  }

  remapWrapper(sources, reports, options) {
    let sourceStore = new MemoryStore();
    let collector = remapIstanbul.remap(remapIstanbul.loadCoverage(sources), {
      sources: sourceStore,
      warn: Log.info
    });

    /* istanbul ignore else */
    if (!Object.keys(sourceStore.map).length) {
      sourceStore = undefined;
    }

    let p = Object.keys(reports).map((reportType) => {
      return remapIstanbul.writeReport(collector, reportType, options, reports[reportType], sourceStore);
    });

    return Promise.all(p);
  }
}
