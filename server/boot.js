import fs from 'fs';
import path from 'path';
import mkdirp from 'mkdirp';
import Conf from './context/conf';
import Router from './router';

export default Boot = {
  startup() {
    // Create reports output folder if not exists
    let outputFolder = path.join(Conf.COVERAGE_APP_FOLDER, Conf.COVERAGE_EXPORT_FOLDER);
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
