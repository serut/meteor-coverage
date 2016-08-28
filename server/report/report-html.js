import CoverageData from '../services/coverage-data';
import Core from '../services/core';
import fs from 'fs';
import path from 'path';
import ReportCommon from './report-common';
import Log from './../context/log';
var istanbulAPI = Npm.require('istanbul-api'),
  Report = istanbulAPI.libReport,
  ReportImpl = istanbulAPI.reportsImpl;
export default class {
  constructor(res, options) {
    this.res = res;
    this.options = options;
    this.prefix = options.prefix;
    this.options.subdir = this.options.path;
    this.opts = this.generateOpts();
    this.report = ReportImpl.create('html', this.opts);
  }

  generateOpts() {
    const outputPath = this.options.path;
    return {
      verbose: this.options.verbose,
      linkMapper: {
        getPath: function (node) {
          if (typeof node === 'string') {
            return node;
          }
          var filePath = node.getQualifiedName();

          if (node.isSummary()) {
            filePath = path.join(outputPath, 'index.html');
          } else {
            filePath = path.join(outputPath, filePath + '.html');
          }
          return filePath;
        },
        relativePath: function (source, target) {
          return this.getPath(target);
        },

        assetPath: function (node, name) {
          return path.join(outputPath, name);
                    //return this.relativePath(this.getPath(node), name);
        }
      }
    };
  }

  generate() {
    const folderPath = this.options.path;
    this.copyStatic();
    var coverage = Core.getCoverageObject();

    if (!(coverage && Object.keys(coverage).length > 0)) {
      this.res.statusCode = 500;
      return this.res.end('{"type":"failed", "message": "No coverage information have been collected"}');
    }
    var root = CoverageData.getTreeReport(coverage);
    let filepath = path.join(folderPath, 'index.html');

    this.report.onSummary(root, ReportCommon.getContext(filepath));

    const childrens = root.getChildren();
    const report = this.report;
        // Todo : use future
    childrens.forEach(function (child) {
      var filepath = path.join(folderPath, child.getRelativeName() + '.html');
      Log.info('Creating a new html report', filepath);
      let fileReport = CoverageData.getFileReport(coverage, child.getRelativeName());
      report.onDetail(fileReport, ReportCommon.getContext(filepath));
    });
    this.res.end('{"type":"success"}');
  }

  copyStatic() {
    ReportCommon.checkDirectory(this.options.path);
    this.report.onStart(null, this.getFolderContext(this.options.path));
  }


  getFolderContext(folderpath) {
    var context = Report.createContext();
    Object.defineProperty(context, 'writer', {
      value: {
        copyFile: function (sourcePath, destPath) {
          fs.readFile(sourcePath, (err, data) => {
            if (err) throw err;
            let p = path.join(folderpath, destPath);
            fs.writeFile(p, data, (err, data) => {
              if (err) throw err;
            });
          });
        }
      }
    });
    return context;
  }
}
