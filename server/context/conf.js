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

if (COVERAGE_APP_FOLDER === ENV_NOT_DEFINED) {
  Log.error('Error: COVERAGE_APP_FOLDER is undefined and the coverage will fail.');
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
    Log.info('Loading default configuration');
    configuration = defaultConfig;
  }

  // Don't force to rewrite all the key of configuration.exclude,
  // if they are not defined, the default conf is used.

  if (configuration.exclude === undefined) {
    Log.info('Loading default configuration: exclude.*');
    configuration.exclude = defaultConfig.exclude;
  }

  if (configuration.exclude.general === undefined) {
    Log.info('Loading default configuration: exclude.general');
    configuration.exclude.general = defaultConfig.exclude.general;
  }

  if (configuration.exclude.server === undefined) {
    Log.info('Loading default configuration: exclude.server');
    configuration.exclude.server = defaultConfig.exclude.server;
  }

  if (configuration.exclude.client === undefined) {
    Log.info('Loading default configuration: exclude.client');
    configuration.exclude.client = defaultConfig.exclude.client;
  }

  if (configuration.include === undefined) {
    Log.info('Loading default configuration: include');
    configuration.include = defaultConfig.include || [];
  }

  if (configuration.output === undefined) {
    Log.info('Loading default configuration: output');
    configuration.output = defaultConfig.output;
  }

  // Source maps remapping
  if (configuration && configuration.remap) {
    if (typeof configuration.remap === 'object') {
      if (configuration.remap.format && configuration.remap.format.constructor !== Array) {
        Log.error('Loading default configuration: remap.format is not an array', configuration.remap.format);
        configuration['remap'] = null;
      }
    } else {
      configuration['remap'] = null;
      Log.error('Loading default configuration: remap is not an object', configuration.remap);
    }
  }
}

export const COVERAGE_EXPORT_FOLDER = configuration.output;
export const exclude = configuration.exclude;
export const include = configuration.include;
export const remap = configuration.remap;

Log.info('Coverage configuration:');
Log.info('- IS_COVERAGE_ACTIVE=', IS_COVERAGE_ACTIVE);
Log.info('- IS_COVERAGE_VERBOSE=', IS_COVERAGE_VERBOSE);
Log.info('- COVERAGE_APP_FOLDER=', COVERAGE_APP_FOLDER);
Log.info('.coverage.json values:');
Log.info('- exclude=', configuration.exclude);
Log.info('- include=', configuration.include);
Log.info('- remap=', configuration.remap);
Log.info('- COVERAGE_EXPORT_FOLDER=', COVERAGE_EXPORT_FOLDER);
