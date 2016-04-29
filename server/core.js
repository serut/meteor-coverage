if (IS_COVERAGE_ACTIVE) {

    var istanbulAPI = Npm.require('istanbul-api'),
        hook = istanbulAPI.libHook,
        Report = istanbulAPI.libReport,
        ReportImpl = istanbulAPI.reportsImpl,
        Coverage = istanbulAPI.libCoverage,
        path = Npm.require('path'),
        fs = Npm.require('fs'),
        reportFilename = 'report.json';


    // Log.info(istanbulAPI)

    function getCoverageObject() {
        /*jslint nomen: true */
        global.__coverage__ = global.__coverage__ || {};
        return global.__coverage__;
    }

    function setCoverageObject(obj) {
        /*jslint nomen: true */
        global.__coverage__ = obj;
    }

    function render(filePath, res, prefix) {
        var coverage = getCoverageObject();

        if (!(coverage && Object.keys(coverage).length > 0)) {
            res.setHeader('Content-type', 'text/plain');
            return res.end('No coverage information has been collected');
        }

        var opts = render_getReportOpts(prefix);
        render_alterFS(res);
        var context = render_getContext(res);
        var report = ReportImpl.create('html', opts)
        var coverageMap = Coverage.createCoverageMap(coverage);
        coverageMap = SourceMap.lib.transformCoverage(coverageMap).map;



        res.setHeader('Content-type', 'text/html');
        if (filePath && coverageMap) {
            //coverageMap = coverageMap.fileCoverageFor(filePath);
            var node = Report.summarizers.flat(coverageMap)
            var childs = node.getRoot().getChildren();
            var child = undefined;
            for (var i = 0; i < childs.length; i++) {
                if (childs[i].getRelativeName() == filePath) {
                    child = childs[i];
                }
            }
            report.onDetail(child, context);
        } else {
            var node = Report.summarizers.flat(coverageMap)
            report.onSummary(node.getRoot(), context);
        }
    }
    function render_getContext(res) {
        var context = Report.createContext();
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
        return context;
    }
    // Istanbul-api expect to save HTML report to the file system and not over network
    function render_alterFS(res) {
        res.close = function() {
            this.end();
        }
    }


    function render_getReportOpts(prefix) {
        return {
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
    }

    function mergeCoverageWith(obj) {
        if (!obj) {
            return;
        }
        var coverage = getCoverageObject();
        var coverageMap = Coverage.createCoverageMap(coverage);
        coverageMap.addFileCoverage(obj);
        setCoverageObject(coverageMap.toJSON());
    }

    function exportFile (res, type) {
        Log.info("export coverage to file using type ", type)

        switch (type) {
            case 'lcovonly':
                var opts = exportFile_getOpts(type),
                    report = ReportImpl.create(type, opts);
                report.file = path.join(COVERAGE_APP_FOLDER, report.file);
                var context = exportFile_getContext(report.file)

                break;
        }
        var coverage = getCoverageObject();

        switch (type) {
            case 'clover':
            case 'cobertura':
            case 'html':
            case 'json':
            case 'json-summary':
            case 'lcov':
            case 'none':
            case 'teamcity':
            case 'text':
            case 'text-lcov':
            case 'text-summary':
                res.end('Not working yet');
                // not working
                break;
            case 'lcovonly':
                coverageMap = SourceMap.lib.transformCoverage(
                    Coverage.createCoverageMap(coverage)
                ).map,
                coverageMap = SourceMap.lib.transformCoverage(coverageMap).map;
                var node = Report.summarizers.flat(coverageMap)
                var childs = node.getRoot().getChildren();
                report.onStart(null, context);
                for (var i = 0; i < childs.length; i++) {
                    report.onDetail(childs[i], context);
                }
                res.end('Thanks !');
                break;
            case 'coverage':
                var coverageReport = JSON.stringify(coverage),
                    reportPath = path.join(COVERAGE_APP_FOLDER, reportFilename);
                fs.writeFile(reportPath, coverageReport, function (err) {
                    if (err) {
                        throw "failed to write report file: "+reportPath
                    }
                    res.end('Thanks !');
                })
                break;
        }
    }
    function exportFile_getOpts(type) {
        var opts = IS_COVERAGE_VERBOSE ? {verbose: true} : {};
        switch (type) {
            case 'teamcity':
                opts.file = 'teamcity.file'
        }
        return opts;
    }
    function exportFile_getContext(filepath) {
        var context = Report.createContext();
        fs.writeFileSync(filepath, '');
        Object.defineProperty(context, 'writer', {
            value: {
                writeFile: function(){
                    return {
                        write: function(data) {
                            fs.appendFileSync(filepath, data, {flag: 'a'});
                        },
                        println: function(data) {
                            fs.appendFileSync(filepath, data + '\r', {flag: 'a'});
                        },
                        close: function() {
                        }
                    };
                }
            }
        });
        return context;
    }

    function importCoverage (res){
        Log.info("import coverage")
        var reportPath = path.join(COVERAGE_APP_FOLDER, reportFilename);
        fs.exists(reportPath, function(exists) {
            if (!exists) {
                throw "report file not found: "+reportPath
            }
            fs.readFile(reportPath, 'utf8', function (err, fileContent) {
                if (err) {
                    throw "failed to read report file: "+reportPath
                }
                var coverageObj = JSON.parse(fileContent);
                for (var property in coverageObj) {
                    if (coverageObj.hasOwnProperty(property)) {
                        mergeCoverageWith(coverageObj[property]);
                    }
                    res.end('Thanks !');
                }
            })
        })
    }

    Core = {
        render: render,
        mergeClientCoverage: mergeCoverageWith,
        exportFile: exportFile,
        importCoverage: importCoverage
    }
}
