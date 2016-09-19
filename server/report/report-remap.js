import Conf from '../context/conf';
import ReportCommon from './report-common';
import IstanbulGenericReporter from './report-generic';
import path from 'path';
const remapIstanbul = Npm.require('remap-istanbul');

export default class {
  constructor(res, type, options) {
    this.res = res;
    this.options = options;
    this.options.verbose = Conf.IS_COVERAGE_VERBOSE ? true : false;
  }

  generateJSONReport() {
    const jsonOptions = Object.assign({}, this.options, {
      path: path.join(this.options.path, 'summary.json')
    });
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
    let remapFolder = path.join(Conf.COVERAGE_EXPORT_FOLDER, 'remap');
    let remapPath = path.join(Conf.COVERAGE_APP_FOLDER, remapFolder);
    ReportCommon.checkDirectory(remapPath);

    let addFile = (filename) => path.join(remapFolder, filename);
    let reports = {}, allReports = {
        'html': remapPath,
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
    remapIstanbul(path.join(this.options.path, 'summary.json'), reports, this.options).await();

    // Restore previous working directory
    process.chdir(cwd);
  }
}
