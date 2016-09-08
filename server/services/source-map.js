import Log from './../context/log';
import Conf from './../context/conf';
import fs from 'fs';

const istanbulAPI = Npm.require('istanbul-api');
const libSourceMaps = istanbulAPI.libSourceMaps;

const sourceMap = libSourceMaps.createSourceMapStore({verbose: Conf.IS_COVERAGE_ACTIVE});
const meteor_dir = Conf.COVERAGE_APP_FOLDER;
// Next RegExps must consider following paths:
//  - meteor://💻app/packages/pkgAuthor[_:]pkgName/...
//  - meteor://💻app/packages/local-test:pkgAuthor:pkgName/...
const regexAlterationSourceMapPath = new RegExp(/(packages\/)(?:local-test[_:])?([a-zA-Z-]*)[_:]([a-zA-Z-_]*)(.*)/);
const regexPUT = new RegExp(/packages\/local-test:([a-zA-Z-_]*):([a-zA-Z-_]*)\/.*/);

// Alter inside the source map the path of each sources
alterSourceMapPaths = function (map) {
  var match;

  if (!Meteor.PUT && Meteor.isPackageTest && meteor_dir === `${process.env.PWD}/`) {
    // Search for the author and name of the PUT (Package Under Test)
    // and save it in Meteor object to be accessible later on
    for (let i = 0; i < map.sources.length; i++) {
      if (regexPUT.test(map.sources[i])) {
        let pkgAuthor, pkgName;
        [, pkgAuthor, pkgName] = regexPUT.exec(map.sources[i]);
        if (!Meteor.PUT) {
          Meteor.PUT = {
            author: pkgAuthor,
            name: pkgName
          };
        }
        break;
      }
    }
  }

  const splitToken = String.fromCharCode(56507) + 'app/';
  for (var i = 0; i < map.sources.length; i++) {
    // Magic character inside the path
    var paths = map.sources[i].split(splitToken);
    if (paths.length === 2) {
      var path = paths[1];
      // if it's a package the path is wrong
      match = regexAlterationSourceMapPath.exec(path);

      if (match) {
        if (Meteor.PUT && match[2] === Meteor.PUT.author && match[3] === Meteor.PUT.name) { // PUT file
          map.sources[i] = meteor_dir + match[4].substr(1);
        } else { // package loaded for app or meteor framework
          map.sources[i] = meteor_dir + match[1] + match[3] + match[4];
        }
      } else {
        map.sources[i] = meteor_dir + path;
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
  registerSourceMap
};
