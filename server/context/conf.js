import Log from './log';
const ENV_NOT_DEFINED = '/SET/ENV/COVERAGE_APP_FOLDER/OR/READ/README/';
export const IS_COVERAGE_ACTIVE = process.env['COVERAGE'] === '1';
export const COVERAGE_APP_FOLDER = process.env['COVERAGE_APP_FOLDER'] || ENV_NOT_DEFINED;

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

  console.log('Coverage active');
  let coverageFile = path.join(COVERAGE_APP_FOLDER, '.coverage.json'),
    defaultConfig = JSON.parse(Assets.getText('conf/default-coverage.json'));

  Log.info('[Default configuration] ', defaultConfig);

  if (fs.existsSync(coverageFile)) {
    Log.info('Reading custom configuration');

    const configurationString = fs.readFileSync(coverageFile);
    configuration = JSON.parse(configurationString);
    Log.info('[Configuration] ', configuration);
  }

    // Set up defaultConfig value if they are not provided in the .coverage.json file
  Log.info('Reading custom configuration');
  if (!configuration) {
    Log.info('Loading default configuration');
    configuration = defaultConfig;
  }

  if (configuration && !configuration.exclude) {
    Log.info('Loading default configuration: exclude');
    configuration.exclude = defaultConfig.exclude || {};
  } else {
    // Don't force to rewrite all the key of configuration.exclude,
    // if they are not defined, the default conf is used.
    if (configuration.exclude.general === undefined) {
      Log.info('Loading default configuration: exclude.general');
      configuration.exclude.general = defautConf.exclude.general;
    }

    if (configuration.exclude.server === undefined) {
      Log.info('Loading default configuration: exclude.server');
      configuration.exclude.server = defautConf.exclude.server;
    }

    if (configuration.exclude.client === undefined) {
      Log.info('Loading default configuration: exclude.client');
      configuration.exclude.client = defautConf.exclude.client;
    }
  }



  if (configuration && !configuration.include) {
    Log.info('Loading defaultConfig configuration: include');
    configuration.include = defaultConfig.include || [];
  }

  if (configuration && !configuration.output) {
    Log.info('Loading defaultConfig configuration: output');
    configuration.output = defaultConfig.output;
  }
}

export const COVERAGE_EXPORT_FOLDER = configuration.output;
export const exclude = configuration.exclude;
export const include = configuration.include;
