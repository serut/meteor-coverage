IS_COVERAGE_ACTIVE = process.env["COVERAGE"] === "1";
if (IS_COVERAGE_ACTIVE) {
    COVERAGE_APP_FOLDER = process.env["COVERAGE_APP_FOLDER"] || '/SET/ENV/COVERAGE_APP_FOLDER/OR/READ/README/';
    var fs = Npm.require('fs'),
        path = Npm.require('path'),
        get = function() {

            var coverageFile = path.join(COVERAGE_APP_FOLDER, '.coverage.json'),
                configuration = {},
                defautConf = JSON.parse(Assets.getText('conf/default-coverage.json'));

            if (fs.existsSync(coverageFile)) {
                Log.info("Reading custom configuration");
                const configurationString = fs.readFileSync(coverageFile);

                configuration = JSON.parse(configurationString);
            }
            // Set up default value if they are not provided in the .coverage.json file
            if (configuration) {
                if (configuration.ignore === undefined) {
                    configuration.ignore = {};
                }
                if (configuration.ignore.clientside === undefined) {
                    Log.info("Loading default configuration: clientside.*");
                    configuration.ignore.clientside = defautConf.ignore.clientside;
                } else {
                    if (configuration.ignore.clientside.inapp === undefined) {
                        Log.info("Loading default configuration: clientside.inapp");
                        configuration.ignore.clientside.inapp = defautConf.ignore.clientside.inapp;
                    }
                    if (configuration.ignore.clientside.public === undefined) {
                        Log.info("Loading default configuration: clientside.public");
                        configuration.ignore.clientside.public = defautConf.ignore.clientside.public;
                    }
                }
                if (configuration.ignore.serverside === undefined) {
                    Log.info("Loading default configuration: serverside");
                    configuration.ignore.serverside = defautConf.ignore.serverside;
                }
                if (configuration.ignore.others === undefined) {
                    Log.info("Loading default configuration: others");
                    configuration.ignore.others = defautConf.ignore.others;
                }
            } else {
                Log.info("Loading default configuration");
                configuration = defautConf;
            }
            return configuration;
        };
    Conf = get();
}
