if (IS_COVERAGE_ACTIVE) {
    var fs = Npm.require('fs');

    var istanbulAPI = Npm.require('istanbul-api'),
        Report = istanbulAPI.libReport,
        Coverage = istanbulAPI.libCoverage;
    CoverageData = {
        filterCoverageReport: function(report) {
            if (report.data == undefined) {
                throw "Invalid report"
            }
            var newData = {};
            for (var property in report.data) {
                if (report.data.hasOwnProperty(property)) {
                    if (this.isAccepted(property)) {
                        //Log.info('isAccepted', property)
                        newData[property] = report.data[property]
                    } else {
                        Log.info('isRefused', property)
                    }
                }
            }
            report.data = newData;
            return report;
        },
        isAccepted: function(filename) {
            // Check if the file was also inside a .map
            if (filename.indexOf(COVERAGE_APP_FOLDER) < 0) {
                return false;
            }
            if (filename.indexOf('packages/') > 0) {
                if (fs.existsSync(filename)) {
                    // Internal package
                    return true;
                } else {
                    // You don't have the source of this package in your workspace
                    return false;
                }
            }
            if (filename.indexOf('client/') > 0 && filename.indexOf('template.') > 0) {
                if (fs.existsSync(filename)) {
                    // some file
                    return true;
                } else {
                    // this is a html template transformed into js file
                    return false;
                }
            }
            if (filename.indexOf('/npm/node_modules') > 0) {
                // this is a browser file?
                return false;
            }
            if (filename.indexOf('node_modules/meteor') > 0) {
                // this is a browser file?
                return false;
            }


            return true;
        },
        getReport: function(coverage) {
            var coverageMap = Coverage.createCoverageMap(coverage);
            coverageMap = SourceMap.lib.transformCoverage(coverageMap).map;
            coverageMap = this.filterCoverageReport(coverageMap);
            return coverageMap;
        },
        getFileReport: function(coverage, filePath) {
            var coverageMap = this.getReport(coverage);
            var node = Report.summarizers.flat(coverageMap)
            var childs = node.getRoot().getChildren();
            var child = undefined;
            for (var i = 0; i < childs.length; i++) {
                if (childs[i].getRelativeName() == filePath) {
                    child = childs[i];
                }
            }
            return child;
        },
        getTreeReport: function (coverage) {
            var coverageMap = this.getReport(coverage);
            var node = Report.summarizers.flat(coverageMap)
            return node.getRoot();
        },
        getLcovonlyReport: function (coverage) {
            coverageMap = this.getReport(coverage);
            var node = Report.summarizers.flat(coverageMap)
            return node.getRoot().getChildren();
        }
    }
}
