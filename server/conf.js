import fs from 'fs';

if (process.env["COVERAGE"] === "1") {
    var get = function() {
        var coverageFile = process.env["COVERAGE_FILE"],
            fileContent;
        if (coverageFile !== undefined) {
            if (fs.existsSync(coverageFile)) {
                fileContent = fs.readFileSync(coverageFile);
            } else {
                console.log("Failed to found the file " + coverageFile + ". The default coverage file will be used");
                fileContent = Assets.getText('conf/default-coverage.json');
            }
        } else {
            fileContent = Assets.getText('conf/default-coverage.json');
        }
        //TODO validate the json
        return JSON.parse(fileContent);
    }
    Conf = {
        get: get
    }
} else {
    console.log("Coverage not launched on this mode (not in test), Meteor.isTest=", Meteor.isTest)
}