import {_} from 'meteor/underscore';
import Log from './../context/log';
import Conf from './../context/conf';
import minimatch from 'minimatch';

let hookLoader, instrumentJs, shouldIgnore, shallInstrumentClientScript, shallInstrumentServerScript;

if (Conf.IS_COVERAGE_ACTIVE) {
    //var im = Npm.require('istanbul-middleware');
  var istanbulAPI = Npm.require('istanbul-api'),
    Hook = istanbulAPI.libHook,
    Instrument = istanbulAPI.libInstrument,
    instrumenter = undefined;

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
        verbose: opts.verbose,
      }
        );
  };

  instrumentJs = function (content, path, callback) {
    SourceMap.registerSourceMap(path);
    return instrumenter.instrument(content, path, callback);
  };

  shouldIgnore = function (filePath, isAServerSideFile) {

    if(!Conf) {
      Log.info('[Config file not found or invalid]:  ', Conf);
      return false;
    }

    if (Conf.include) {
      Log.info('[Including]');
      Log.info('[Verifying]: ', filePath);
      if (Conf.include.some(pattern => fileMatch(pattern))) {
        Log.info('[Included]: ', filePath);
        return false;
      }
    }

    let shouldIgnore = false;
    if (!Conf.exclude) return false;
    if (Conf.exclude.general) {
      shouldIgnore = Conf.exclude.general.some(pattern => fileMatch(pattern));
      Log.info('[Ignoring][general]');
      Log.info('[Verifying]: ', filePath);
      if(shouldIgnore) {
        Log.info('[Ignored]: ', filePath);
      }
    }

    if (!shouldIgnore && Conf.exclude.server && isAServerSideFile) {
      shouldIgnore = Conf.exclude.server.some(pattern => fileMatch(pattern));
      Log.info('[Ignoring][server]');
      Log.info('[Verifying]: ', filePath);
      if(shouldIgnore) {
        Log.info('[Ignored]: ', filePath);
      }
    }

    if (!shouldIgnore && Conf.exclude.client && !isAServerSideFile) {
      shouldIgnore = Conf.exclude.client.some(pattern => fileMatch(pattern));
      Log.info('[Ignoring][client]');
      Log.info('[Verifying]: ', filePath);
      if(shouldIgnore) {
        Log.info('[Ignored]: ', filePath);
      }
    }

    return shouldIgnore;

    function fileMatch(pattern) {
      let fileMatched = minimatch(filePath, pattern, { dot: true });
      return fileMatched;
    }
  };

  shallInstrumentClientScript = function (fileurl) {
    if (fileurl.indexOf('.js') > -1) {
      if (fileurl.indexOf('packages') === 1) {
        if (!shouldIgnore(fileurl, false)) {
          Log.info('[ClientSide][InApp] file instrumented: ' + fileurl);
          return true;
        } else {
          Log.info('[ClientSide][InApp] file ignored: ' + fileurl);
          return false;
        }
      } else {
        let instrumented = !shouldIgnore(fileurl, false);
        if (instrumented) {
          Log.info('[ClientSide][Public] file instrumented: ' + fileurl);
        } else {
          Log.info('[ClientSide][Public] file ignored: ' + fileurl);
        }
        return instrumented;
      }
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
      if (!shouldIgnore(file, true)) {
        SourceMap.registerSourceMap(root + file);
        Log.info('[ServerSide][Package] file instrumented: ' + file);
        return true;
      } else {
        Log.info('[ServerSide][Package] file ignored: ' + file);
      }
    } else {

      if (!shouldIgnore(root + file, true)) {
        SourceMap.registerSourceMap(root + file);
        Log.info('[ServerSide][App.js] file instrumented: ' + file);
        return true;
      } else {
        Log.info('[ServerSide][App.js] file ignored: ' + file);
      }
    }

    return false;
  };
}

if (hookLoader === undefined) {
  hookLoader = function () {

  };
}

export default Instrumenter = {
  hookLoader,
  instrumentJs,
  shouldIgnore,
  shallInstrumentClientScript,
  shallInstrumentServerScript
};
