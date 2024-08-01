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
  exclude: {
    general: [],
    server: [],
    client: []
  },
  include: [],
  output: NOT_DEFINED
};
/* istanbul ignore else */
if (IS_COVERAGE_ACTIVE) {
  const fs = Npm.require('fs'),
    path = Npm.require('path');

  Log.info('Coverage active');
  let coverageFile = path.join(COVERAGE_APP_FOLDER, '.coverage.json');
  const defaultConfigPath = Assets.absoluteFilePath('conf/default-coverage.json');
  let defaultConfig = JSON.parse(fs.readFileSync(defaultConfigPath));

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

  // Don't force to rewrite all the key of configuration.exclude,
  // if they are not defined, the default conf is used.

  /* istanbul ignore else */
  if (configuration.exclude === undefined) {
    Log.info('Loading default configuration: exclude.*');
    configuration.exclude = defaultConfig.exclude;
  }

  /* istanbul ignore else */
  if (configuration.exclude.general === undefined) {
    Log.info('Loading default configuration: exclude.general');
    configuration.exclude.general = defaultConfig.exclude.general;
  }

  /* istanbul ignore else */
  if (configuration.exclude.server === undefined) {
    Log.info('Loading default configuration: exclude.server');
    configuration.exclude.server = defaultConfig.exclude.server;
  }

  /* istanbul ignore else */
  if (configuration.exclude.client === undefined) {
    Log.info('Loading default configuration: exclude.client');
    configuration.exclude.client = defaultConfig.exclude.client;
  }

  /* istanbul ignore else */
  if (configuration.include === undefined) {
    Log.info('Loading default configuration: include');
    configuration.include = defaultConfig.include || [];
  }

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
export const exclude = configuration.exclude;
export const include = configuration.include;
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
Log.info('- exclude=', configuration.exclude);
Log.info('- include=', configuration.include);
Log.info('- remapFormat=', configuration.remapFormat);
Log.info('- COVERAGE_EXPORT_FOLDER=', COVERAGE_EXPORT_FOLDER);
