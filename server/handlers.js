import Conf from './context/conf';
import Core from './services/core';
import ReportService from './report/report-service';
import fs from 'fs';
import path from 'path';

showCoverage = function (params, req, res, next) {
  let options = {
    'filepath': params.query.p
  };
  let reportService = new ReportService();
  reportService.generateReport(res, 'http', options);
};

getAsset = function (params, req, res, next) {
  var assetsDir = path.join(path.resolve('.'), 'assets/packages/lmieulet_meteor-coverage/assets/'),
    filename = params.filename;
  fs.exists(path.join(assetsDir, filename), function (exists) {
    if (!exists) {
      fs.exists(path.join(assetsDir, '/vendor/', filename), function (exists) {
        /* istanbul ignore else */
        if (!exists) return next();
        fs.readFile(assetsDir + '/vendor/' + filename, function (err, fileContent) {
          /* istanbul ignore else */
          if (err) {
            console.error(err);
            return next();
          }
          res.end(fileContent);
        });
      });
    } else {
      fs.readFile(assetsDir + '/' + filename, function (err, fileContent) {
        /* istanbul ignore else */
        if (err) {
          console.error(err);
          return next();
        }
        res.end(fileContent);
      });
    }
  });
};

addClientCoverage = function (params, req, res, next) {
  var body = req.body;
  /* istanbul ignore else */
  if (!body) {
    res.writeHead(400);
    res.end();
  }

  var clientCoverage;
  for (var property in body) {
    /* istanbul ignore else */
    if (Object.hasOwn(body, property)) {
      clientCoverage = body[property];
    }
  }
  if (clientCoverage) {
    Core.mergeCoverageWith(clientCoverage);
    res.end('{"type":"success"}');
  } else {
    res.writeHead(400);
    res.end('Nothing has been imported');
  }
};

exportFile = function (params, req, res, next) {
  var _type = params.type;
  /* istanbul ignore next: ternary operator */
  type = Conf.reportTypes.allowed.indexOf(_type) > -1 ? _type : 'coverage';
  try {
    let reportService = new ReportService();
    reportService.generateReport(res, type, {});
  } catch (e) {
    Log.error('Failed to export', e, e.stack);
    res.writeHead(400);
    res.end('Nothing has been export');
  }
};
importCoverage = function (params, req, res, next) {
  try {
    Core.importCoverage(res);
  } catch (e) {
    Log.error('Failed to import', e, e.stack);
    res.writeHead(400);
    res.end('No file has been import');
  }
};

export default Handlers = {
  showCoverage,
  getAsset,
  addClientCoverage,
  exportFile,
  importCoverage
};
