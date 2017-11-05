import fs from 'fs';
import mkdirp from 'mkdirp';
import path from 'path';
import Log from './../context/log';
const Report = Npm.require('istanbul-lib-report');


export default ReportCommon = {
    /**
     * Alter fs to add a new method writer
     * Used by the istanbul-reports library
     * @param filepath
     * @returns {*|Context}
     */

  getContext (filepath) {
    let context = Report.createContext();

    const dirpath = path.dirname(filepath);
    this.checkDirectory(dirpath);
    this.checkFile(filepath);

    Object.defineProperty(context, 'writer', {
      value: {
        writeFile: function (path) {
          return {
            write: function (data) {
              fs.appendFileSync(path, data);
            },
            println: function (data) {
              fs.appendFileSync(path, data + '\r\n');
            },
            close: function () {},
            colorize: function(string) {
              return string;
            }
          };
        }
      }
    });
    return context;
  },
  checkDirectory (dirpath) {
    let succeed = true;
    // Create folder
    try {
      const stat = fs.statSync(dirpath);
    } catch (e) {
      succeed = false;
      Log.info('Creating a new folder', dirpath);
      try {
        mkdirp.sync(dirpath);
      } catch (e) {
        console.error('Something went wrong while creating folder', e, e.stack);
      }
    }
    return succeed;
  },
  checkFile (filepath) {
    let succeed = true;
    // Reset file
    try {
      Log.info('Try to remove the content & create the file', filepath);
      fs.writeFileSync(filepath, '');
    } catch (e) {
      succeed = false;
      console.error('Something went wrong while creating the file', filepath, e, e.stack);
    }
    return succeed;
  }
};
