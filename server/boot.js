import fs from 'node:fs';
import path from 'node:path';
import mkdirp from 'mkdirp';
import { COVERAGE_APP_FOLDER, COVERAGE_EXPORT_FOLDER } from './context/conf';
import Log from './context/log';
import Router from './router';

const Boot = {
  startup() {
    // Create reports output folder if not exists
    let outputFolder = path.join(COVERAGE_APP_FOLDER, COVERAGE_EXPORT_FOLDER);
    fs.access(outputFolder, fs.F_OK | fs.R_OK | fs.W_OK, (err) => {
      /* istanbul ignore else */
      if (err) {
        try {
          mkdirp(outputFolder);
        } catch (e) {
          console.error (`meteor-coverage failed to create the folder ${outputFolder} while booting:`, e);
          Log.error(e.stack);
        }
      }
    });
    // Connect the router to this app
    new Router();
  }
};

export default Boot;