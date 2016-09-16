import Log from './../context/log';
import Conf from './../context/conf';
import fs from 'fs';
import path from 'path';

const homedir = Npm.require('homedir');
const istanbulAPI = Npm.require('istanbul-api');
const libSourceMaps = istanbulAPI.libSourceMaps;

const sourceMap = libSourceMaps.createSourceMapStore({verbose: Conf.IS_COVERAGE_ACTIVE});
const meteorDir = Conf.COVERAGE_APP_FOLDER;
const splitToken = String.fromCharCode(56507) + 'app/'; // caution! magic character inside the SourceMap source(s) path

const abspath = {
  local: path.join(__meteor_bootstrap__.serverDir, '..', '..', '..'), // could use process.env.METEOR_SHELL_DIR too
  currentBuild: path.join(__meteor_bootstrap__.serverDir, '..'),
  serverSide: __meteor_bootstrap__.serverDir,
  clientSide: path.join(__meteor_bootstrap__.serverDir, '..', 'web.browser'),
  // Meteor packages folder can be overriden with the env var PACKAGE_DIRS, otherwise
  // '$HOME/.meteor/packages'. Take a look at https://dweldon.silvrback.com/local-packages
  // or https://github.com/meteor/meteor/blob/devel/History.md#v040-2012-aug-30
  packages: process.env.PACKAGE_DIRS || path.join(homedir(), '.meteor', 'packages')
};
const rgx = {
  meteorPackageMergedFile: /^\/packages\/(local-test_)?(?:([^\/_]+)_)?([^\/_]+).js$/,
  meteorPackagePathTokens: /^(?:packages\/|node_modules\/meteor\/)(?:local-test[_:])?([^_:\/]+[_:])?([^_:\/]+)\/(node_modules\/)?(.*)$/,
  meteorPUT: /^local-test:([^_:\/]+:[^_:\/]+)$/,
  packageJson: /^(?:\.npm\/package\/node_modules\/(.*)|\.\.\/npm\/node_modules\/(.*))$/
};

isAccessible = function(path, mode = fs.R_OK, supressErrors = false) {
  try {
    fs.accessSync(path, mode);
    return true;
  } catch (e) {
    !supressErrors && Log.error('Cannot access ', path);
    return false;
  }
};
parseJSON = function(filePath, supressAccessErrors = false) {
  if (isAccessible(filePath, fs.R_OK, supressAccessErrors)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch(e) {
      Log.Error('Invalid JSON: ', filePath, e);
    }
  }
};

initialSetup = function () {
  // Get the resolved, compiled and used packages and their versions
  let resolverResultPath = path.join(abspath.local, 'resolver-result-cache.json');
  let resolverResult = parseJSON(resolverResultPath);
  this.resolved = resolverResult ? resolverResult.lastOutput.answer : null;

  if (Meteor.isPackageTest && this.resolved) {
    // Find the package(s) under test (PUT)
    for (let pkg in this.resolved) {
      if (this.resolved.hasOwnProperty(pkg)) {
        let match = rgx.meteorPUT.exec(pkg);
        match && (this.PUT[match[1]] = true);
      }
    }
    const PUTs = Object.keys(this.PUT);
    if (PUTs.length) {
      Log.info(`Packages under test (${PUTs.length}):`, PUTs.join(', '));
    } else {
      Log.error('No packages under test in test-packages mode');
    }

    // Check if testing from inside (package-dir) or outside (meteor-app-dir)
    // We only need to check ONE test file, but we must consider that all PUTs
    // maybe client-side or server-side, so we should check both and exit on first match
    const sidePaths = {
      load: abspath.serverSide,
      manifest: abspath.clientSide
    };
    for (let key in sidePaths) {
      const programPath = path.join(sidePaths[key], 'program.json');
      const program = parseJSON(programPath);
      if (!program) continue;

      for (let file of program[key]) {
        if (file.path.startsWith('packages/local-test_')) { // meteor package test(s) merged file
          const sourceMapPath = path.join(sidePaths[key], file.sourceMap);
          const sourceMap = parseJSON(sourceMapPath);
          if (!sourceMap) continue;

          // A compiled test file (local-test_...) has only the declared test
          // files inside `package.js` as its sources, so check the first one
          this.testingFromPackageDir = true;
          let filepathToCheck = fixSourcePath.call(this, sourceMap.sources[0], null, meteorDir);
          if (!isAccessible(filepathToCheck, fs.R_OK, true)) {
            this.testingFromPackageDir = false;
          }
          break;
        }
      }
      if (this.testingFromPackageDir !== undefined) break;
    }
    if (this.testingFromPackageDir === undefined) {
      Log.error('User running test-packages without tests');
    }
  }
};

// Alter inside the source map the path of each sources
_alterSourceMapPaths = function (map, isClientSide) {
  // Absolute path to sources of a Meteor package. PUTs are treated differently than normal because they
  // might not exist at abspath.packages, so PUT packages always are resolved depending on
  // COVERAGE_APP_FOLDER and whether `meteor test-packages` was executed from inside/outside the package
  // folder. Sources base of any Meteor packages not under test is always resolved to abspath.packages
  let sourcesBase, isTestFile, matchAuthor, matchName;
  if (rgx.meteorPackageMergedFile.test(map.file)) {
    [, isTestFile, matchAuthor, matchName] = rgx.meteorPackageMergedFile.exec(map.file);
    const packageID = matchAuthor ? `${matchAuthor}:${matchName}` : matchName;
    if (Meteor.isPackageTest && (!!isTestFile || this.PUT[packageID])) {
      sourcesBase = this.testingFromPackageDir ? meteorDir : path.join(meteorDir, 'packages', matchName);
    } else if (this.resolved[packageID]) {
      const packageFolder = matchAuthor ? `${matchAuthor}_${matchName}` : matchName;
      sourcesBase = path.join(abspath.packages, packageFolder, this.resolved[packageID], 'web.browser');
    }
  }

  // Get `node_modules` base path for this map.file
  let nodeModulesBase, program = parseJSON(path.join(abspath.serverSide, 'program.json'));
  if (!isClientSide && program) {
    // Find the item matching map.file path
    const mergedPath = map.file.substr(1);
    for (let file of program.load) {
      if (file.path === mergedPath) {
        if (file.node_modules) {
          nodeModulesBase = path.join(abspath.serverSide, file.node_modules);
          nodeModulesBase = fs.realpathSync(nodeModulesBase); // usually a symlink
        }
        break;
      }
    }
  }
  if (!nodeModulesBase && sourcesBase) {
    // Try locating node_modules inside sourcesBase sibling `npm`
    let sourcesSiblingFolder = path.join(sourcesBase, '..', 'npm', 'node_modules');
    if (isAccessible(sourcesSiblingFolder, fs.R_OK, true)) {
      nodeModulesBase = sourcesSiblingFolder;
    }
  }

  // Fix sources paths, but be aware that, although you might be tempted to remove items
  // from map.{sources|contentSources} (like non-instrumentable files: *.css, *.json,...),
  // you must NOT do it, because their indexes are still being used by the mappings and
  // you'll get a sound `Error('No element indexed by {index}')`.
  for (let i = 0; i < map.sources.length; i++) {
    let fixed = fixSourcePath.call(this, map.sources[i], nodeModulesBase, sourcesBase);

    if (map.sources[i] === fixed) {
      Log.error('Source could not be altered:', map.sources[i]);
    } else if (isAccessible(fixed)) {
      map.sources[i] = fixed;
    } else {
      Log.error('Altered source could not be accessed:', map.sources[i]);
    }
  }
  return map;
};

// Fixes path of a source (file) in the SourceMap of a concatenated Meteor package test file
fixSourcePath = function(source, nodeModulesBase, sourcesBase) {
  let match, paths = source.split(splitToken).slice(1);

  // Skip sources with unknown syntax
  if (!paths.length) {
    Log.error('Source with unknown format:', source);
    return source;
  }

  // The source is the package.json of a NPM dependency. Catches all next patterns:
  //  1. meteor://💻app/.npm/package/node_modules/minimatch/package.json
  //  2. meteor://💻app/../npm/node_modules/meteor-babel-helpers/package.json
  match = rgx.packageJson.exec(paths[0]);
  if (match) {
    return match[1] ? path.join(nodeModulesBase, match[1]) : path.join(sourcesBase, paths[0]);
  }

  // The source is a Meteor package file (NPM dep or own file). Catches all next patterns:
  //  3. meteor://💻app/packages/lmieulet:meteor-coverage/server/index.js
  //  4. meteor://💻app/packages/local-test:lmieulet:meteor-coverage/server/tests.js
  //  5. meteor://💻app/node_modules/meteor/lmieulet:meteor-coverage/node_modules/minimatch/minimatch.js
  //  6. meteor://💻app/node_modules/meteor/local-test:cgalvarez:my-package/tests/client/mocks.js
  //  7. meteor://💻app/node_modules/meteor/local-test:cgalvarez:my-package/node_modules/chai-as-promised/lib/chai-as-promised.js
  let matchAuthor, matchName, isNpmDep, matchPath;
  match = rgx.meteorPackagePathTokens.exec(paths[0]);
  if (match) {
    [, matchAuthor, matchName, isNpmDep, matchPath] = match;
    return path.join(isNpmDep ? nodeModulesBase : sourcesBase, matchPath);
  }

  // Meteor app file
  return path.join(meteorDir, paths[0]);
};

// Processes the source map (when exists) of an instrumented file to fix broken sources paths
registerSourceMap = function(filepath) {
  Log.time('START registerSourceMap', filepath);
  const sourceMapPath = filepath + '.map';
  let fileContent = parseJSON(sourceMapPath, true);
  if (fileContent) {
    fileContent = _alterSourceMapPaths.call(this, fileContent,
      filepath.startsWith('../web.browser/') || filepath.startsWith(abspath.clientSide));
    Log.info('Add source map for file', sourceMapPath);
    sourceMap.registerMap(filepath, fileContent);
  } else {
    Log.info('Source map not found', sourceMapPath);
  }
  Log.timeEnd('END registerSourceMap', filepath);
};

export default SourceMap = {
  initialSetup,
  lib: sourceMap,
  PUT: {},                          // Meteor package(s) under test
  registerSourceMap,
  resolved: undefined,              // Meteor packages in use and their version
  testingFromPackageDir: undefined  // Whether `meteor test-packages` is run from inside/outside the package dir
};
