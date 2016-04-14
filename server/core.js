if (IS_COVERAGE_ACTIVE) {

    var istanbulAPI = Npm.require('istanbul-api'),
        hook = istanbulAPI.libHook,
        Report = istanbulAPI.libReport,
        ReportImpl = istanbulAPI.reportsImpl,
        Coverage = istanbulAPI.libCoverage,
        path = Npm.require('path'),
        fs = Npm.require('fs');


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

    Core = {
        render: render,
        mergeClientCoverage: mergeCoverageWith,
    }
}