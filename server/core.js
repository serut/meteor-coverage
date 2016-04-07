if (process.env["COVERAGE"] === "1") {
    //var im = Npm.require('istanbul-middleware');
    var istanbulAPI = Npm.require('istanbul-api'),
        hook = istanbulAPI.libHook,
        Report = istanbulAPI.libReport,
        instrumenter = istanbulAPI.libInstrument.createInstrumenter();
        istanbul = Npm.require('istanbul'),
        utils = istanbul.utils,
        path = Npm.require('path'),
        fs = Npm.require('fs'),
        sourceMap = istanbulAPI.libSourceMaps.createSourceMapStore({verbose: true}),
        conf = Conf.get();
    console.log(istanbulAPI)


    //single place to get global coverage object
    function getCoverageObject() {
        /*jslint nomen: true */
        global.__coverage__ = global.__coverage__ || {};
        return global.__coverage__;
    }

    /**
     *
     * a match function with signature `fn(file)` that returns true if `file` needs to be instrumented
     * @returns {Function}
     */
    shallInstrumentServerScript = function (file) {
        var root = __meteor_bootstrap__.serverDir;
        if (file.indexOf(root) !== 0) {
            return false;
        }
        file = file.substring(root.length);
        if (file.indexOf('node_modules') >= 0) {
            return false;
        }
        if (file.indexOf('/packages') >= 0) {
            var packageName = file.split('/packages/');
            if (!_.contains(conf.ignore.serverside.packages, packageName[1])) {
                registerSourceMapFor(root+file);
                return true;
            } else {
                console.log("[DEBUG] - Ignore the file /packages" + file)
            }
        } else {
            if (!_.contains(conf.ignore.serverside.inapp, file)) {
                registerSourceMapFor(root+file);
                return true;
            } else {
                console.log("[DEBUG] - Ignore the file " + file)
            }
        }
        return false;
    }

    /**
     * hooks `require` to add instrumentation to matching files loaded on the server
     * @method hookLoader
     * @param {Object} opts instrumenter options
     */
    function hookLoader(opts) {
        /*jslint nomen: true */
        var transformer,
            postLoadHook,
            postLoadHookFn;

        //returns a matcher that returns all JS files under root
        //except when the file is anywhere under `node_modules`
        //does not use istanbul.matcherFor() so as to expose
        //a synchronous interface
        opts = opts || {};
        opts.verbose = true
        opts.coverageVariable = '__coverage__'; //force this always


        instrumenter = istanbulAPI.libInstrument.createInstrumenter(opts);
        var transformer = instrumenter.instrumentSync.bind(instrumenter);

        hook.hookRunInThisContext(
            shallInstrumentServerScript,
            transformer,
            {
                verbose: opts.verbose,
            }
        );
    }

    function render(filePath, res, prefix) {
        var treeSummary,
            pathMap,
            linkMapper,
            outputNode,
            report,
            fileCoverage,
            coverage = getCoverageObject();

        if (!(coverage && Object.keys(coverage).length > 0)) {
            res.setHeader('Content-type', 'text/plain');
            return res.end('No coverage information has been collected'); //TODO: make this a fancy HTML report
        }

        prefix = prefix || '';
        if (prefix.charAt(prefix.length - 1) !== '/') {
            prefix += '/';
        }

        var opts = {
            verbose: true,
            linkMapper: {
                getPath: function (node) {
                    if (typeof node === 'string') {
                        return node;
                    }
                    var filePath = node.getQualifiedName();
                    return filePath;
                },
                relativePath: function (source, target) {
                    return prefix + "show?p=" + this.getPath(target);;
                },
                assetPath: function (node, name) {
                    return prefix + "asset/" + name;
                }
            }
        }
        var report = istanbulAPI.reportsImpl.create('html', opts)
        var coverageMap = istanbulAPI.libCoverage.createCoverageMap(coverage);
        console.log("sourceMap", sourceMap.transformCoverage(coverageMap));
        var context = istanbulAPI.libReport.createContext();
        Object.defineProperty(context, 'writer', {
            value: {
                writerForDir: {
                    writeFile: function(){
                        return res;
                    }
                },
                writeFile: function(){
                    return res;
                }
            }
        });
        
        // Mock the res because Istanbul-api does not provide a clean way to send 
        // the HTML over the network
        res.close = function() {
            this.end();
        }
        res.setHeader('Content-type', 'text/html');
        if (filePath && coverageMap) {
            //coverageMap = coverageMap.fileCoverageFor(filePath);
            var node = istanbulAPI.libReport.summarizers.flat(coverageMap)
            var childs = node.getRoot().getChildren();
            var child = undefined;
            for (var i = 0; i < childs.length; i++) {
                if (childs[i].getRelativeName() == filePath) {
                    child = childs[i];
                }
            }
            report.onDetail(child, context);
        } else {
            var coverageMap = istanbulAPI.libCoverage.createCoverageMap(coverage);
            var node = istanbulAPI.libReport.summarizers.flat(coverageMap)
            report.onSummary(node.getRoot(), context);
        }
    }

    function mergeClientCoverage(obj) {
        if (!obj) {
            return;
        }
        var coverage = getCoverageObject();
        Object.keys(obj).forEach(function (filePath) {
            var original = coverage[filePath],
                added = obj[filePath],
                result;
            if (original) {
                result = utils.mergeFileCoverage(original, added);
            } else {
                result = added;
            }
            coverage[filePath] = result;
        });
    }

    instrumentSync = function (content, path) {
        return instrumenter.instrumentSync(content, path);
    }
    shallInstrumentClientScript = function (fileurl) {
        if (fileurl.indexOf('.js') > -1) {
            if (fileurl.indexOf('packages') === 1) {
                if (!_.contains(conf.ignore.clientside.inapp, fileurl)) {
                    return true;
                }
            } else {
                if (!_.contains(conf.ignore.clientside.public, fileurl)) {
                    return true;
                }
            }
        }
        return false;
    }
    registerSourceMapFor = function (filepath) {
        // SIDE EFFECTS

        sourceMapPath = filepath + ".map";
        console.log(sourceMapPath)
        if (fs.existsSync(sourceMapPath)) {
            fileContent = fs.readFileSync(sourceMapPath);
            console.log("Add source map for file " + sourceMapPath)
            sourceMap.registerMap(filepath, fileContent);
        }
    }
    Core = {
        istanbul: istanbul,
        render: render,
        shallInstrumentClientScript: shallInstrumentClientScript,
        mergeClientCoverage: mergeClientCoverage,
        instrumentSync: instrumentSync,
        hookLoader: hookLoader
    }
}