import {_} from 'meteor/underscore';
import Log from './../context/log';
import Conf from './../context/conf';
import minimatch from 'minimatch';
const Instrument  = Npm.require('istanbul-lib-instrument'),
     Hook = Npm.require('istanbul-lib-hook');
let instrumenter = undefined;

/**
 * hooks `runInThisContext` to add instrumentation to matching files when they are loaded on the server
 * @method hookLoader
 * @param {Object} opts instrumenter options
 */
hookLoader = function (opts) {
  /* istanbul ignore next: default assignment */
  opts = opts || {};
  opts.verbose = true;
  opts.coverageVariable = '__coverage__'; // force this always

  /* istanbul ignore else */
  if (instrumenter !== undefined) {
    throw 'Instrumenter already defined ! You cannot call this method twice';
  }
  instrumenter = Instrument.createInstrumenter(opts);
  Hook.hookRunInThisContext(
    shallInstrumentServerScript,
    function (code, options) {
      var filename = typeof options === 'string' ? options : options.filename;
      return instrumenter.instrumentSync(code, filename);
    },
    {
      verbose: opts.verbose
    }
  );
};

instrumentJs = function (content, path, callback) {
  SourceMap.registerSourceMap(path);
  return instrumenter.instrument(content, path, callback);
};

fileMatch = function (filePath, pattern) {
  return minimatch(filePath, pattern, {dot: true});
};
shouldIgnore = function (filePath, isAServerSideFile) {
  // Force the inclusion of any file using config file
  /* istanbul ignore else */
  if (Conf.include) {
    /* istanbul ignore else */
    if (Conf.include.some(pattern => Instrumenter.fileMatch(filePath, pattern))) {
      Log.info('[Accepted][include]: ', filePath);
      return false;
    }
  }

  /* istanbul ignore else */
  if (Conf.exclude.general) {
    /* istanbul ignore else */
    if (Conf.exclude.general.some(pattern => Instrumenter.fileMatch(filePath, pattern))) {
      Log.info('[Ignored][exclude.general]: ', filePath);
      return true;
    }
  }

  /* istanbul ignore else */
  if (Conf.exclude.server && isAServerSideFile) {
    /* istanbul ignore else */
    if (Conf.exclude.server.some(pattern => Instrumenter.fileMatch(filePath, pattern))) {
      Log.info('[Ignored][exclude.server]: ', filePath);
      return true;
    }
  }

  /* istanbul ignore else */
  if (Conf.exclude.client && !isAServerSideFile) {
    /* istanbul ignore else */
    if (Conf.exclude.client.some(pattern => Instrumenter.fileMatch(filePath, pattern))) {
      Log.info('[Ignored][exclude.client]: ', filePath);
      return true;
    }
  }

  Log.info('[Accepted][*]: ', filePath);
  return false;
};

shallInstrumentClientScript = function (fileurl) {
  /* istanbul ignore else */
  if (fileurl.indexOf('.js') > -1) {
    /* istanbul ignore else */
    if (!Instrumenter.shouldIgnore(fileurl, false)) {
      Log.info('[ClientSide][Public] file instrumented: ' + fileurl);
      return true;
    }
    Log.info('[ClientSide][Public] file ignored: ' + fileurl);
    return false;
  }
  return false;
};


/**
 *
 * a match function with signature `fn(file)` that returns true if `file` needs to be instrumented
 * if the result is true, it also reads the corresponding source map
 * @returns {Function}
 */
shallInstrumentServerScript = function (file) {
  var root = __meteor_bootstrap__.serverDir;
  /* istanbul ignore else */
  if (file.indexOf(root) !== 0) {
    Log.info('[ServerSide][OutsideApp] file ignored: ' + file);
    return false;
  }
  file = file.substring(root.length);
  /* istanbul ignore else */
  if (file.indexOf('node_modules') >= 0) {
    Log.info('[ServerSide][node_modules] file ignored: ' + file);
    return false;
  }
  if (file.indexOf('packages') === 1) {
    /* istanbul ignore else */
    if (!Instrumenter.shouldIgnore(file, true)) {
      SourceMap.registerSourceMap(root + file);
      return true;
    }
  } else {
    /* istanbul ignore else */
    if (!Instrumenter.shouldIgnore(root + file, true)) {
      SourceMap.registerSourceMap(root + file);
      return true;
    }
  }

  return false;
};

export default Instrumenter = {
  hookLoader,
  instrumentJs,
  shouldIgnore,
  fileMatch,
  shallInstrumentClientScript,
  shallInstrumentServerScript
};
