IS_COVERAGE_ACTIVE = process.env["COVERAGE"] === "1";
if (IS_COVERAGE_ACTIVE) {
    COVERAGE_APP_FOLDER = process.env["COVERAGE_APP_FOLDER"] || '/SET/ENV/COVERAGE_APP_FOLDER/OR/READ/README/';
    var fs = Npm.require('fs'),
        path = Npm.require('path'),
        get = function() {
        var coverageFile = path.join(COVERAGE_APP_FOLDER, '.coverage.json'),
            fileContent;
        if (coverageFile !== undefined) {
            if (fs.existsSync(coverageFile)) {
                Log.info("Reading custom configuration");
                fileContent = fs.readFileSync(coverageFile);
            } else {
                Log.error("Failed to found the file " + coverageFile + ". The default coverage file will be used");
                fileContent = Assets.getText('conf/default-coverage.json');
            }
        } else {
            Log.info("Reading default configuration");
            fileContent = Assets.getText('conf/default-coverage.json');
        }
        //TODO validate the json
        return JSON.parse(fileContent);
    };
    Conf = get();
}
