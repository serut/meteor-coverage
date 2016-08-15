import Log from './log'

export const IS_COVERAGE_ACTIVE = process.env["COVERAGE"] === "1";
export const COVERAGE_APP_FOLDER = process.env["COVERAGE_APP_FOLDER"] || '/SET/ENV/COVERAGE_APP_FOLDER/OR/READ/README/';

let configuration;
if (IS_COVERAGE_ACTIVE) {
    const fs = Npm.require('fs'),
        path = Npm.require('path');

    console.log("Coverage active")
    let coverageFile = path.join(COVERAGE_APP_FOLDER, '.coverage.json'),
        defaultConfig = JSON.parse(Assets.getText('conf/default-coverage.json'));

    Log.info("[Default configuration] ", defaultConfig);

    if (fs.existsSync(coverageFile)) {
        Log.info("Reading custom configuration");

        const configurationString = fs.readFileSync(coverageFile);
        configuration = JSON.parse(configurationString);
        Log.info("[Configuration] ", configuration);
    }

    // Set up defaultConfig value if they are not provided in the .coverage.json file
    Log.info("Reading custom configuration");
    if (!configuration) {
        Log.info("Loading defaultConfig configuration");
        configuration = defaultConfig;
    }

    if (configuration && !configuration.exclude) {
        Log.info("Loading defaultConfig configuration: exclude");
        configuration.exclude = configuration.exclude || {};
    }

    if (configuration && !configuration.include) {
        Log.info("Loading defaultConfig configuration: include");
        configuration.include = configuration.include || [];
    }

    if (configuration && !configuration.output) {
        Log.info("Loading defaultConfig configuration: output");
        configuration.output = defaultConfig.output;
    }
}

export const COVERAGE_EXPORT_FOLDER = configuration.output;
export const exclude = configuration.exclude;
export const include = configuration.include;
