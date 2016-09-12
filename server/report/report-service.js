import IstanbulGenericReporter from './report-generic';
import ReportCommon from './report-common';
import JsonSummary from './report-json-summary';
import Teamcity from './report-teamcity';
import Html from './report-html';
import Http from './report-http';
import ReportCoverage from './report-coverage';
import Log from './../context/log';
import TextSummary from './report-text-summary';
import Conf from './../context/conf';
import path from 'path';

export default class {
  generateReport(res, type, options) {

    options = Object.assign({}, {
      path: path.join(Conf.COVERAGE_APP_FOLDER, Conf.COVERAGE_EXPORT_FOLDER),
      verbose: Log.COVERAGE_VERBOSE ? true : false
    }, options);

    Log.info('export coverage using the following format [', type, '] options [', options, ']');
    try {
      switch (type) {
      case 'lcovonly':
        {
          options = this.addFileToOptions(options, 'lcov.info');
          let istanbulFile1 = new IstanbulGenericReporter(res, type, options);
          istanbulFile1.generate();
          break;
        }
      case 'json':
        {
          options = this.addFileToOptions(options, 'summary.json');
          let istanbulFile2 = new IstanbulGenericReporter(res, type, options);
          istanbulFile2.generate();
          Conf.remap && this.remapSourceMaps(options);
          break;
        }
      case 'coverage':
        {
          options = this.addFileToOptions(options, 'report.json');
          let reportCoverage = new ReportCoverage(res, options);
          reportCoverage.generate();
          break;
        }
      case 'teamcity':
        {
          let teamcity = new Teamcity(res, options);
          teamcity.generate();
          break;
        }
      case 'json-summary':
        {
          options = this.addFileToOptions(options, 'json_summary.json');
          let jsonSummary = new JsonSummary(res, type, options);
          jsonSummary.generate();
          break;
        }
      case 'html':
        {
          options = Object.assign({}, {
            'prefix': '/coverage/'
          }, options);
          let html = new Html(res, options);
          html.generate();
          break;
        }
      case 'text-summary':
        {
          options = this.addFileToOptions(options, 'summary.txt');
          let textSummary = new TextSummary(res, type, options);
          textSummary.generate();
          break;
        }
      case 'http':
        {
          let http = new Http(res, options);
          http.generate();
          break;
        }
      case 'clover':
      case 'cobertura':
      case 'lcov':
      case 'none':
      case '':
      case 'text':
      case 'text-lcov':
      default:
        {
          Log.error('Failed to export - this type is not implemented');
          res.writeHead(400);
          res.end('{"type":"This type [' + type + '] is not supported"}');
        }
      }
    } catch (e) {
      Log.error('ReportService failed while creating report type [', type, ']');
      console.error(e, e.stack);
      res.writeHead(400);
      res.end('{"type":"error","message":"Unexpected error"}');
    }
  }
  addFileToOptions(options, filename) {
    return Object.assign({}, options, {
      path: path.join(options.path, filename)
    });
  }
  remapSourceMaps(options) {
    const remapIstanbul = Npm.require('remap-istanbul');
    const cwd = process.cwd();
    process.chdir(Conf.COVERAGE_APP_FOLDER);

    // Create output directory if not exists
    let remapFolder = `${Conf.COVERAGE_EXPORT_FOLDER}-remap`;
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
      'json': addFile('report.json'),
    };
    Conf.remap.format.forEach((type) => reports[type] = allReports[type]);
    remapIstanbul(options.path, reports, {verbose: options.verbose}).await();

    // Restore previous working directory
    process.chdir(cwd);
  }
}
