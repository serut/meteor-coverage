import Log from './../context/log';
import Conf from './../context/conf';
import fs from 'fs';
import path from 'path';

const homedir = Npm.require('homedir');
const libSourceMaps = Npm.require('istanbul-lib-source-maps');

const sourceMap = libSourceMaps.createSourceMapStore({verbose: Conf.IS_COVERAGE_ACTIVE});
const meteorDir = Conf.COVERAGE_APP_FOLDER;
const splitToken = String.fromCharCode(56507) + 'app/'; // caution! magic character inside the SourceMap source(s) path

const abspath = {
  local: path.join(__meteor_bootstrap__.serverDir, '..', '..', '..'), // could use process.env.METEOR_SHELL_DIR too
  currentBuild: path.join(__meteor_bootstrap__.serverDir, '..'),
  serverSide: __meteor_bootstrap__.serverDir,
  clientSide: path.join(__meteor_bootstrap__.serverDir, '..', 'web.browser'),
  // Meteor packages folder can be overriden with the env var PACKAGE_DIRS, otherwise '$HOME/.meteor/packages'.
  // Read https://guide.meteor.com/writing-atmosphere-packages.html#overriding-atmosphere-packages
  packages: process.env.PACKAGE_DIRS || path.join(homedir(), '.meteor', 'packages')
};
const rgx = {
  meteorCompiledTemplate: /\/template\.[^\.\/]+\.js$/,
  meteorPackageMergedFile: /^\/packages\/(local-test_)?(?:([^\/_]+)_)?([^\/_]+).js$/,
  meteorPackagePathTokens: /^(?:packages\/|node_modules\/meteor\/)(?:local-test[_:])?(([^_:\/]+[_:])?([^_:\/]+))\/(.*node_modules\/)?(.*)$/,
  meteorPUT: /^local-test:((?:[^_:\/]+:)?[^_:\/]+)$/,
  packageJson: /^(?:\.\.\/npm\/node_modules\/(.*)|\.\.\/\.\.\/(?:(?!node_modules).)*(.*)|.*node_modules\/(.*))$/
};

isAccessible = function(path, mode = fs.R_OK, supressErrors = false) {
  try {
    fs.accessSync(path, mode);
    return true;
  } catch (e) {
    /* istanbul ignore else */
    if (!supressErrors) {
      Log.error('Cannot access', path);
    }
    return false;
  }
};

parseJSON = function(filePath, supressAccessErrors = false) {
  /* istanbul ignore else */
  if (isAccessible(filePath, fs.R_OK, supressAccessErrors)) {
    try {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch(e) {
      /* istanbul ignore next: Meteor should have saved an invalid JSON, quite improbable */
      Log.error('Invalid JSON:', filePath, e);
    }
  }
};

initialSetup = function () {
  // Get the resolved, compiled and used packages and their versions
  let resolverResultPath = path.join(abspath.local, 'resolver-result-cache.json');
  let resolverResult = parseJSON(resolverResultPath);
  /* istanbul ignore next: ternary operator */
  this.resolved = resolverResult ? resolverResult.lastOutput.answer : null;

  /* istanbul ignore else */
  if (Meteor.isPackageTest) {
    /* istanbul ignore else */
    if (this.resolved) {
      // Find the package(s) under test (PUT)
      for (let pkg in this.resolved) {
        /* istanbul ignore else */
        if (this.resolved.hasOwnProperty(pkg)) {
          let match = rgx.meteorPUT.exec(pkg);
          match && (this.PUT[match[1]] = true);
        }
      }
      const PUTs = Object.keys(this.PUT);
      /* istanbul ignore else */
      if (PUTs.length) {
        Log.info(`Packages under test (${PUTs.length}):`, PUTs.join(', '));
      } else {
        Log.error('No packages under test in test-packages mode');
      }
    }

    // Check if testing from inside (pkg/) or outside (app/). We test all the merged files of meteor package(s) tests(s)
    // assuming that `meteor test-packages` was exec from the package folder which the merged test file belongs to:
    //  - If none can be accessed, then command is exec from app-dir
    //  - If one can be accessed, then command is exec from pkg-dir of that package
    // The possibilities when testing packages are:
    //  1. `app/packages/pkg$ meteor test-packages ...opts`     inside (COVERAGE_APP_FOLDER points to app/packages/pkg/), test N packages
    //  2. `app/packages/pkg$ meteor test-packages ./ ...opts`  inside (COVERAGE_APP_FOLDER points to app/packages/pkg/), test 1 package
    //  3. `app$ meteor test-packages ...opts`                  outside (COVERAGE_APP_FOLDER points to app/), test N packages
    //  4. `app$ meteor test-packages author:pkg...opts`        outside (COVERAGE_APP_FOLDER points to app/), test 1 package
    //  5. `app$ meteor test-packages packages/pkg...opts`      outside (COVERAGE_APP_FOLDER points to app/), test 1 package
    // NOTE: `...opts` represents the remaining command options (`--driver-package`, etc.)
    const sidePaths = {
      load: abspath.serverSide,
      manifest: abspath.clientSide
    };
    for (let key in sidePaths) {
      /* istanbul ignore else */
      if (sidePaths.hasOwnProperty(key)) {
        const programPath = path.join(sidePaths[key], 'program.json');
        const program = parseJSON(programPath);
        /* istanbul ignore next: file automatically created by Meteor, so really rare to enter here */
        if (!program) continue;

        for (let file of program[key]) {
          let isTestFile, matchAuthor, matchName, match = rgx.meteorPackageMergedFile.exec(`/${file.path}`);
          // If it's a meteor package test(s) merged file and the package has tests (the merged file is created whether
          // the package has tests file(s) declared in `package.js` inside `Package.onTest()` or not). The way to know
          // whether the package has tests or not is looking at file.sourceMap: if it's empty, it has no tests.
          /* istanbul ignore else */
          if (match && match[1] && file.sourceMap) {
            [, isTestFile, matchAuthor, matchName] = match;
            const sourceMapPath = path.join(sidePaths[key], file.sourceMap);
            const sourceMap = parseJSON(sourceMapPath);
            /* istanbul ignore else */
            if (!sourceMap) continue; // jump to the next file if SourceMap non-accessible or invalid

            // A compiled test file (local-test_...) has only the declared test
            // files inside `package.js` as its sources, so check the first one
            this.testingFromPackageDir = `${matchAuthor}:${matchName}`;
            let filepathToCheck = fixSourcePath.call(this, sourceMap.sources[0], null, meteorDir);
            if (!isAccessible(filepathToCheck, fs.R_OK, true)) {
              this.testingFromPackageDir = false;
            } else {
              break;
            }
          }
        }
      }
      /* istanbul ignore else */
      if (this.testingFromPackageDir) break;
    }
  }
};

// Alter inside the source map the path of each sources
alterSourceMapPaths = function (map, isClientSide) {
  // Absolute path to sources of a Meteor package. PUTs are treated differently than normal because they
  // might not exist at abspath.packages, so PUT packages always are resolved depending on
  // COVERAGE_APP_FOLDER and whether `meteor test-packages` was executed from inside/outside the package
  // folder. Sources base of any Meteor packages not under test is always resolved to abspath.packages
  let sourcesBase, isTestFile, matchAuthor, matchName;
  /* istanbul ignore else */
  if (rgx.meteorPackageMergedFile.test(map.file)) {
    [, isTestFile, matchAuthor, matchName] = rgx.meteorPackageMergedFile.exec(map.file);
    /* istanbul ignore next: ternary operator */
    const packageID = matchAuthor ? `${matchAuthor}:${matchName}` : matchName;
    if (Meteor.isPackageTest && (!!isTestFile || this.PUT[packageID])) {
      // If exec `meteor test-packages` from `meteor-app-dir/packages/pkg-dir/` then Meteor performs tests on ALL
      // packages at `meteor-app-dir/packages`, just like exec `meteor test-packages` from `meteor-app-dir/`, but
      // this affects `sourcesBase` for PUTs, because PUTs outside COVERAGE_APP_FOLDER must change their sourcesBase
      if (this.testingFromPackageDir) {
        sourcesBase = this.testingFromPackageDir === packageID ? meteorDir : path.join(meteorDir, '..', matchName);
      } else {
        sourcesBase = path.join(meteorDir, 'packages', matchName);
      }
    } else {
      /* istanbul ignore else */
      if (this.resolved[packageID]) {
        /* istanbul ignore next: ternary operator */
        const packageFolder = matchAuthor ? `${matchAuthor}_${matchName}` : matchName;
        sourcesBase = path.join(abspath.packages, packageFolder, this.resolved[packageID], 'web.browser');
      }
    }
  }

  // Get `node_modules` base path for this map.file
  let nodeModulesBase, program = parseJSON(path.join(abspath.serverSide, 'program.json'));
  /* istanbul ignore else */
  if (!isClientSide && program) {
    // Find the item matching map.file path
    const mergedPath = map.file.substr(1);
    for (let file of program.load) {
      /* istanbul ignore else */
      if (file.path === mergedPath) {
        /* istanbul ignore else */
        if (file.node_modules) {
          try {
            // For the current package it appears it can be an object, with two slightly different paths.
            if (typeof file.node_modules === 'object') {
              for (var nModulePath in file.node_modules) {
                // there is several files, just need to find the local{bool} having true
                if (file.node_modules[nModulePath].local) {
                  nodeModulesBase = path.join(abspath.serverSide, nModulePath);
                  break; // cut the loop
                }
              }
            } else {
              nodeModulesBase = path.join(abspath.serverSide, file.node_modules);
            } 
            nodeModulesBase = fs.realpathSync(nodeModulesBase); // usually a symlink
          } catch (e) {
            if (e.code === 'ENOENT') {
              Log.info('File not found!', nodeModulesBase);
            } else {
              throw e;
            }
          }
        }
        break;
      }
    }
  }
  /* istanbul ignore else */
  if (!nodeModulesBase && sourcesBase) {
    // Try locating node_modules inside sourcesBase sibling `npm`
    let sourcesSiblingFolder = path.join(sourcesBase, '..', 'npm', 'node_modules');
    /* istanbul ignore else */
    if (isAccessible(sourcesSiblingFolder, fs.R_OK, true)) {
      nodeModulesBase = sourcesSiblingFolder;
    }
  }

  // Fix sources paths, but be aware that, although you might be tempted to remove items
  // from map.{sources|contentSources} (like non-instrumentable files: *.css, *.json,...),
  // you must NOT do it, because their indexes are still being used by the mappings and
  // you'll get a sound `Error('No element indexed by {index}')`.
  for (let i = 0; i < map.sources.length; i++) {
    // Meteor templates are not saved into files, but included in sourcesContent
    /* istanbul ignore else */
    if (rgx.meteorCompiledTemplate.test(map.sources[i])) {
      Log.info('Skipping Meteor template:', map.sources[i]);
      continue;
    }

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
  /* istanbul ignore else */
  if (!paths.length) {
    Log.error('Source with unknown format:', source);
    return source;
  }

  // The source is the package.json of a NPM dependency. Catches all next patterns:
  //  1. meteor://💻app/.npm/package/node_modules/minimatch/package.json
  //    [1 may be @ nodeModulesBase (when non-PUT) or sourcesBase (when PUT)]
  //  2. meteor://💻app/../npm/node_modules/meteor-babel-helpers/package.json (package NPM dep)
  //  3. meteor://💻app/../../app-dir/node_modules/meteor-node-stubs/node_modules/string_decoder/package.json (app NPM dep)
  //  4. meteor://💻app/node_modules/http-errors/node_modules/inherits/package.json
  //  5. meteor://💻app/node_modules/content-type/package.json
  /* istanbul ignore else */
  if (paths[0].endsWith('/package.json')) {
    match = rgx.packageJson.exec(paths[0]);
    /* istanbul ignore else */
    if (match) {
      /* istanbul ignore else */
      if (match[2]) { // covers 3 (app NPM dep package.json)
        return path.join(meteorDir, match[2]);
      }
      /* istanbul ignore else */
      if (match[3] && nodeModulesBase) {
        // covers 1 (when non-PUT), 4 and 5 (meteor pkg NPM dep package.json)
        return path.join(nodeModulesBase, match[3]);
      }
      return path.join(sourcesBase, paths[0]); // covers 1 (when PUT) and 2
    }
  }

  // The source is a Meteor package file (NPM dep or own file). Catches all next patterns:
  //  6. meteor://💻app/packages/lmieulet:meteor-coverage/server/index.js
  //  7. meteor://💻app/packages/local-test:lmieulet:meteor-coverage/server/tests.js
  //  8. meteor://💻app/node_modules/meteor/lmieulet:meteor-coverage/node_modules/minimatch/minimatch.js
  //  9. meteor://💻app/node_modules/meteor/local-test:cgalvarez:my-package/tests/client/mocks.js
  //  10. meteor://💻app/node_modules/meteor/local-test:cgalvarez:my-package/node_modules/chai-as-promised/lib/chai-as-promised.js
  //  11. meteor://💻app/node_modules/meteor/local-test:kadira:flow-router/node_modules/page/node_modules/path-to-regexp/node_modules/isarray/index.js
  let matchPackageID, matchAuthor, matchName, matchNpmDepPath, matchPath;
  match = rgx.meteorPackagePathTokens.exec(paths[0]);
  /* istanbul ignore else */
  if (match) {
    [, matchPackageID, matchAuthor, matchName, matchNpmDepPath, matchPath] = match;
    /* istanbul ignore else */
    if (this.PUT[matchPackageID]) { // PUT
      /* istanbul ignore else */
      if (matchNpmDepPath) {
        // There is no way to know a priori if it's a recursive dep or not
        let recNpmDep = path.join(sourcesBase, '.npm', 'package', matchNpmDepPath, matchPath);
        /* istanbul ignore else */
        if (isAccessible(recNpmDep, fs.R_OK, true)) {
          return recNpmDep; // check if recursive dep (11) of PUT
        }
        return path.join(sourcesBase, '.npm', 'package', 'node_modules', matchPath); // first level dep (10) of PUT
      }
      return path.join(sourcesBase, matchPath); // covers 6,7,8,9 when PUT
    }

    /* istanbul ignore else */
    if (Meteor.isPackageTest) {
      return path.join(matchNpmDepPath ? nodeModulesBase : sourcesBase, matchPath); // non PUT
    }

    // Package inside app-dir/packages on `meteor test ...`
    return path.join(meteorDir, 'packages', matchName, matchPath);
  }

  // Meteor app file
  return path.join(meteorDir, paths[0]);
};

// Processes the source map (when exists) of an instrumented file to fix broken sources paths
registerSourceMap = function(filepath) {
  const sourceMapPath = filepath + '.map';
  let fileContent = parseJSON(sourceMapPath, true);
  if (fileContent) {
    Log.time('registerSourceMap', filepath);
    fileContent = alterSourceMapPaths.call(this, fileContent,
      filepath.startsWith('../web.browser/') || filepath.startsWith(abspath.clientSide));
    Log.info('Add source map for file', sourceMapPath);
    sourceMap.registerMap(filepath, fileContent);
    Log.timeEnd('registerSourceMap', filepath);
  } else {
    Log.info('Source map not found', sourceMapPath);
  }
};

export default SourceMap = {
  initialSetup,
  lib: sourceMap,
  PUT: {},                          // Meteor package(s) under test
  registerSourceMap,
  resolved: undefined,              // Meteor packages in use and their version
  testingFromPackageDir: undefined  // Whether `meteor test-packages` is run from inside/outside the package dir
};
