if (IS_COVERAGE_ACTIVE) {
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
        opts.verbose = true
        opts.coverageVariable = '__coverage__'; //force this always

        if (instrumenter !== undefined) {
            throw "Instrumenter already defined ! You cannot call this method twice";
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
    }

    instrumentClientScript = function (content, path) {
        SourceMap.registerSourceMap(path);
        return instrumenter.instrumentSync(content, path);
    }


    shallInstrumentClientScript = function (fileurl) {
        if (fileurl.indexOf('.js') > -1) {
            if (fileurl.indexOf('packages') === 1) {
                if (!_.contains(Conf.ignore.clientside.inapp, fileurl)) {
                    return true;
                } else {
                    Log.info("[DEBUG][CLIENT] - Ignore the file " + file)
                }
            } else {
                if (!_.contains(Conf.ignore.clientside.public, fileurl)) {
                    return true;
                } else {
                    Log.info("[DEBUG][CLIENT] - Ignore the file /public" + file)
                }
            }
        }
        return false;
    }


    /**
     *
     * a match function with signature `fn(file)` that returns true if `file` needs to be instrumented
     * if the result is true, it also reads the corresponding source map
     * @returns {Function}
     */
    shallInstrumentServerScript = function (file) {
        var root = __meteor_bootstrap__.serverDir;
        if (file.indexOf(root) !== 0) {
            return false;
        } else {
            Log.info("Ignore the file " + file)
        }
        file = file.substring(root.length);
        if (file.indexOf('node_modules') >= 0) {
            return false;
        } else {
            Log.info("Ignore this node_modules " + file)
        }
        if (file.indexOf('/packages') >= 0) {
            var packageName = file.split('/packages/');
            if (!_.contains(Conf.ignore.serverside.packages, packageName[1])) {
                SourceMap.registerSourceMap(root+file);
                return true;
            } else {
                Log.info("coverage.json ignore the file " + file)
            }
        } else {
            if (!_.contains(Conf.ignore.serverside.inapp, file)) {
                SourceMap.registerSourceMap(root+file);
                return true;
            } else {
                Log.info("coverage.json ignore the file " + file)
            }
        }
        return false;
    }

    Instrumenter = {
        instrumentClientScriptSync: instrumentClientScript,
        shallInstrumentClientScript: shallInstrumentClientScript,
        hookLoader: hookLoader
    }
}