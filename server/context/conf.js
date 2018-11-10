import Log from './log';
const meteor_parameters = {
  // /:\ ES 6
  // return the value OR UNDEFINED
  // THIS IS NOT A BOOLEAN
  IS_COVERAGE_ACTIVE: Meteor && Meteor.settings && Meteor.settings.coverage && Meteor.settings.coverage.is_coverage_active,
  COVERAGE_APP_FOLDER: Meteor && Meteor.settings && Meteor.settings.coverage && Meteor.settings.coverage.coverage_app_folder
};

export const IS_COVERAGE_ACTIVE = meteor_parameters.IS_COVERAGE_ACTIVE ||  process.env['COVERAGE'] === '1';
export const IS_COVERAGE_VERBOSE = Log.COVERAGE_VERBOSE;
const ENV_NOT_DEFINED = '/SET/ENV/COVERAGE_APP_FOLDER/OR/READ/README/';

export const COVERAGE_APP_FOLDER = meteor_parameters.COVERAGE_APP_FOLDER || process.env['COVERAGE_APP_FOLDER'] || ENV_NOT_DEFINED;

/* istanbul ignore else */
if (COVERAGE_APP_FOLDER === ENV_NOT_DEFINED) {
  Log.info('Error: COVERAGE_APP_FOLDER is undefined and the coverage will fail.');
}
const NOT_DEFINED = '/COVERAGE/NOT/ACTIVE/';
let configuration = {
  output: NOT_DEFINED
};
/* istanbul ignore else */
if (IS_COVERAGE_ACTIVE) {
  const fs = Npm.require('fs'),
    path = Npm.require('path');

  Log.info('Coverage active');
  let coverageFile = path.join(COVERAGE_APP_FOLDER, '.coverage.json'),
    defaultConfig = JSON.parse(Assets.getText('conf/default-coverage.json'));

  try {
    fs.accessSync(coverageFile);
    Log.info('Reading custom configuration');
    const configurationString = fs.readFileSync(coverageFile);
    configuration = JSON.parse(configurationString);
    Log.info('[Configuration] ', configuration);
  } catch (e) {
    if (e instanceof SyntaxError) {
      let errMsg = `Error: ${coverageFile} is not a valid JSON`;
      console.error(errMsg, e);
      Log.error(e.stack);
    }
    // Set up defaultConfig value if they are not provided in the .coverage.json file
    Log.info('Loading default configuration, missing configuration file ', coverageFile);
    configuration = defaultConfig;
  }

  // Don't force to rewrite all the key of configuration.

  /* istanbul ignore else */
  if (configuration.output === undefined) {
    Log.info('Loading default configuration: output');
    configuration.output = defaultConfig.output;
  }

  /* istanbul ignore else */
  if (configuration.remapFormat === undefined) {
    Log.info('Loading default configuration: remapFormat');
    configuration.remapFormat = defaultConfig.remapFormat;
  }
}

export const COVERAGE_EXPORT_FOLDER = configuration.output;
export const remapFormat = configuration.remapFormat;
export const reportTypes = {
  allowed: ['clover', 'cobertura', 'coverage', 'html', 'json', 'json-summary', 'lcov', 'lcovonly', 'remap', 'teamcity', 'text', 'text-lcov', 'text-summary'],
  pending: ['clover', 'cobertura', 'lcov', 'teamcity', 'text', 'text-lcov']
};

Log.info('Coverage configuration:');
Log.info('- IS_COVERAGE_ACTIVE=', IS_COVERAGE_ACTIVE);
Log.info('- IS_COVERAGE_VERBOSE=', IS_COVERAGE_VERBOSE);
Log.info('- COVERAGE_APP_FOLDER=', COVERAGE_APP_FOLDER);
Log.info('.coverage.json values:');
Log.info('- remapFormat=', configuration.remapFormat);
Log.info('- COVERAGE_EXPORT_FOLDER=', COVERAGE_EXPORT_FOLDER);
