import {_} from 'meteor/underscore';
import Log from './../context/log';
import Conf from './../context/conf';
import minimatch from 'minimatch';

import * as IstanbulApi from 'istanbul-api';
const Instrument = IstanbulApi.libInstrument;
const Hook = IstanbulApi.libHook;

let instrumenter = undefined;

/**
 * hooks `runInThisContext` to add instrumentation to matching files when they are loaded on the server
 * @method hookLoader
 * @param {Object} opts instrumenter options
 */
hookLoader = function (opts) {
  opts = opts || {};
  opts.verbose = true;
  opts.coverageVariable = '__coverage__'; //force this always

  if (instrumenter !== undefined) {
    throw 'Instrumenter already defined ! You cannot call this method twice';
  }
  instrumenter = Instrument.createInstrumenter(opts);
  var transformer = instrumenter.instrumentSync.bind(instrumenter);
  Hook.hookRunInThisContext(
    shallInstrumentServerScript,
    transformer,
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
  if (Conf.include) {
    if (Conf.include.some(pattern => Instrumenter.fileMatch(filePath, pattern))) {
      Log.info('[Accepted][include]: ', filePath);
      return false;
    }
  }

  if (Conf.exclude.general) {
    if (Conf.exclude.general.some(pattern => Instrumenter.fileMatch(filePath, pattern))) {
      Log.info('[Ignored][exclude.general]: ', filePath);
      return true;
    }
  }

  if (Conf.exclude.server && isAServerSideFile) {
    if (Conf.exclude.server.some(pattern => Instrumenter.fileMatch(filePath, pattern))) {
      Log.info('[Ignored][exclude.server]: ', filePath);
      return true;
    }
  }

  if (Conf.exclude.client && !isAServerSideFile) {
    if (Conf.exclude.client.some(pattern => Instrumenter.fileMatch(filePath, pattern))) {
      Log.info('[Ignored][exclude.client]: ', filePath);
      return true;
    }
  }

  Log.info('[Accepted][*]: ', filePath);
  return false;
};

shallInstrumentClientScript = function (fileurl) {
  if (fileurl.indexOf('.js') > -1) {
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
  if (file.indexOf(root) !== 0) {
    Log.info('[ServerSide][OutsideApp] file ignored: ' + file);
    return false;
  }
  file = file.substring(root.length);
  if (file.indexOf('node_modules') >= 0) {
    Log.info('[ServerSide][node_modules] file ignored: ' + file);
    return false;
  }
  if (file.indexOf('packages') === 1) {
    if (!Instrumenter.shouldIgnore(file, true)) {
      SourceMap.registerSourceMap(root + file);
      Log.info('[ServerSide][Package] file instrumented: ' + file);
      return true;
    }
    Log.info('[ServerSide][Package] file ignored: ' + file);
  } else {

    if (!Instrumenter.shouldIgnore(root + file, true)) {
      SourceMap.registerSourceMap(root + file);
      Log.info('[ServerSide][App.js] file instrumented: ' + file);
      return true;
    }
    Log.info('[ServerSide][App.js] file ignored: ' + file);
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
