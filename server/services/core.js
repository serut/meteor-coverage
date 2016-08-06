import Conf from './../context/conf'
let mergeCoverageWith, importCoverage, getCoverageObject;

if (Conf.IS_COVERAGE_ACTIVE) {

    var istanbulAPI = Npm.require('istanbul-api'),
        Coverage = istanbulAPI.libCoverage,
        path = Npm.require('path'),
        fs = Npm.require('fs');

    getCoverageObject = function () {
        /*jslint nomen: true */
        global.__coverage__ = global.__coverage__ || {};
        return global.__coverage__;
    }

    setCoverageObject = function (obj) {
        /*jslint nomen: true */
        global.__coverage__ = obj;
    }

    mergeCoverageWith = function (obj) {
        if (!obj) {
            return;
        }
        var coverage = getCoverageObject();
        var coverageMap = Coverage.createCoverageMap(coverage);
        coverageMap.addFileCoverage(obj);
        setCoverageObject(coverageMap.toJSON());
    }


    importCoverage = function (res, options = {}) {
        Log.info("import coverage");
        var filename = options.filename ? options.filename : 'report.json';
        var reportPath = path.join(Conf.COVERAGE_APP_FOLDER, Conf.COVERAGE_EXPORT_FOLDER, filename);
        fs.exists(reportPath, function (exists) {
            if (!exists) {
                throw "report file not found: reportPath=" + reportPath + " COVERAGE_APP_FOLDER=" + Conf.COVERAGE_APP_FOLDER;
            }
            fs.readFile(reportPath, 'utf8', function (err, fileContent) {
                if (err) {
                    throw "failed to read report file: " + reportPath;
                }
                var coverageObj = JSON.parse(fileContent);
                for (var property in coverageObj) {
                    if (coverageObj.hasOwnProperty(property)) {
                        Core.mergeCoverageWith(coverageObj[property]);
                    }
                }
                res.end('{"type":"success"}');
            });
        });
    }
}
export default Core = {
    mergeCoverageWith: mergeCoverageWith ? mergeCoverageWith : function () {
    },
    importCoverage: importCoverage ? importCoverage : function () {
    },
    getCoverageObject: getCoverageObject ? getCoverageObject : function () {
    }
};