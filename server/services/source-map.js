import Log from './../context/log';
import Conf from './../context/conf';
import fs from 'fs';
import path from 'path';

const istanbulAPI = Npm.require('istanbul-api');
const libSourceMaps = istanbulAPI.libSourceMaps;

const sourceMap = libSourceMaps.createSourceMapStore({verbose: Conf.IS_COVERAGE_ACTIVE});
const meteor_dir = Conf.COVERAGE_APP_FOLDER;
// Next RegExps must consider following paths:
//  1. meteor://💻app/packages/lmieulet:meteor-coverage/server/index.js
//  2. meteor://💻app/.npm/package/node_modules/minimatch/package.json
//  3. meteor://💻app/node_modules/meteor/lmieulet:meteor-coverage/node_modules/minimatch/minimatch.js
//  4. meteor://💻app/packages/local-test:lmieulet:meteor-coverage/server/tests.js
//  5. meteor://💻app/node_modules/meteor/local-test:cgalvarez:my-package/tests/client/mocks.js
//  6. meteor://💻app/node_modules/meteor/local-test:cgalvarez:my-package/node_modules/chai-as-promised/lib/chai-as-promised.js
const regexAlterationSourceMapPath = new RegExp(/^(packages\/|node_modules\/meteor\/)(?:local-test[_:])?([a-zA-Z-]*)[_:]([a-zA-Z-_]*)(.*)$/);
const regexPUT = new RegExp(/packages\/local-test:([a-zA-Z-_]*):([a-zA-Z-_]*)\/.*/);

// Alter inside the source map the path of each sources
alterSourceMapPaths = function (map) {
  var match;
  if (!this.PUT && Meteor.isPackageTest && meteor_dir === `${process.env.PWD}/`) {
    // Search for the author and name of the PUT (Package Under Test)
    // and save it in Meteor object to be accessible later on
    for (let i = 0; i < map.sources.length; i++) {
      if (regexPUT.test(map.sources[i])) {
        let pkgAuthor, pkgName;
        [, pkgAuthor, pkgName] = regexPUT.exec(map.sources[i]);
        if (!this.PUT) {
          this.PUT = {
            author: pkgAuthor,
            name: pkgName
          };
        }
        break;
      }
    }
  }

  const npmPkgFolder = 'node_modules';
  const npmPkgDepPrefix = `${npmPkgFolder}/meteor/`;
  const splitToken = String.fromCharCode(56507) + 'app/';
  for (var i = 0; i < map.sources.length; i++) {
    // Magic character inside the path
    var paths = map.sources[i].split(splitToken);
    if (paths.length === 2) {
      let matchAuthor, matchName, matchPath;
      // if it's a package the path is wrong
      match = regexAlterationSourceMapPath.exec(paths[1]);
      if (match) {
        matchAuthor = match[3];
        matchName = match[4];
        matchPath = match[5];
        // Imported NPM dependency
        // Custom user file imported in test file or package loaded for app or meteor framework
        if (this.PUT && matchAuthor === this.PUT.author && matchName === this.PUT.name && matchPath && match[1] === npmPkgDepPrefix && matchPath.startsWith(npmPkgFolder, 1)) {
          map.sources[i] = path.join(meteor_dir, '.npm/package', matchPath);
          // the continue statement breaks one iteration of the loop
          continue;
        }
      }
      if (matchPath) {
        map.sources[i] = path.join(meteor_dir,  matchPath);
      } else {
        map.sources[i] = path.join(meteor_dir, paths[1]);
      }
    } else {
      Log.error('Failed to alter source map path', map.sources[i]);
    }
  }
  return map;
};

registerSourceMap = function (filepath) {
  // SIDE EFFECTS
  Log.time('registerSourceMap' + filepath);
  sourceMapPath = filepath + '.map';
  if (fs.existsSync(sourceMapPath)) {
    fileContent = JSON.parse(fs.readFileSync(sourceMapPath, 'utf8'));
    fileContent = alterSourceMapPaths(fileContent);
    Log.info('Add source map for file ' + sourceMapPath);
    sourceMap.registerMap(filepath, fileContent);
  } else {
    Log.error('Source map not found', sourceMapPath);
  }
  Log.timeEnd('registerSourceMap' + filepath);
};
export default SourceMap = {
  lib: sourceMap,
  PUT: {},
  registerSourceMap
};
