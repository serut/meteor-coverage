import { _ } from 'meteor/underscore';

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
        opts.verbose = true;
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
    };

    instrumentJs = function (content, path, callback) {
        SourceMap.registerSourceMap(path);
        return instrumenter.instrument(content, path, callback);
    };

    checkIfAutorised = function (filters, file) {
        let allowed = true;
        for (let i = 0; i < filters.length; i ++) {
            let filterRegex = new RegExp(filters[i], "i");
            allowed = allowed && filterRegex.test(file) === false;
            if (!allowed) {
                return false;
            }
        }
        return allowed;
    };

    shallInstrumentClientScript = function (fileurl) {
        if (fileurl.indexOf('.js') > -1) {
            if (fileurl.indexOf('packages') === 1) {
                if (checkIfAutorised(Conf.ignore.clientside.inapp, fileurl)) {
                    Log.info("[ClientSide][InApp] file instrumented: " + fileurl);
                    return true;
                } else {
                    Log.info("[ClientSide][InApp] file ignored: " + fileurl);
                    return false;
                }
            } else {
                let instrumented = checkIfAutorised(Conf.ignore.clientside.public, fileurl);
                if (instrumented) {
                    Log.info("[ClientSide][Public] file instrumented: " + fileurl);
                } else {
                    Log.info("[ClientSide][Public] file ignored: " + fileurl);
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
            Log.info("[ServerSide][OutsideApp] file ignored: " + file);
            return false;
        }
        file = file.substring(root.length);
        if (file.indexOf('node_modules') >= 0) {
            Log.info("[ServerSide][node_modules] file ignored: " + file);
            return false;
        }
        if (file.indexOf('packages') === 1) {
            if (checkIfAutorised(Conf.ignore.serverside, file)) {
                SourceMap.registerSourceMap(root+file);
                Log.info("[ServerSide][Package] file instrumented: " + file);
                return true;
            } else {
                Log.info("[ServerSide][Package] file ignored: " + file);
            }
        } else {
            SourceMap.registerSourceMap(root+file);
            Log.info("[ServerSide][App.js] file instrumented: " + file);
            return true;
        }
        return false;
    };

    Instrumenter = {
        instrumentJs: instrumentJs,
        shallInstrumentClientScript: shallInstrumentClientScript,
        hookLoader: hookLoader,
        checkIfAutorised: checkIfAutorised
    };
}
