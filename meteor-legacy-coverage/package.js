Package.describe({
  name: 'lmieulet:meteor-legacy-coverage',
  version: '0.2.0',
  summary: 'Instrument packages and app files in a legacy way',
  git: 'https://github.com/serut/meteor-coverage',
  documentation: 'README.md',
  debugOnly: true // this package is not included on prod
});

const dependencies = {
  'istanbul-lib-source-maps': '2.0.1',
  'istanbul-lib-instrument': '3.3.0',
  'istanbul-lib-hook': '2.0.1',
  'istanbul-lib-coverage': '2.0.1',
  'istanbul-lib-report': '2.0.2',
  'istanbul-reports': '2.0.1',
  'body-parser': '1.18.2',
  'minimatch': '3.0.4',
  'mkdirp': '0.5.1',
  'homedir': '0.6.0',
  'remap-istanbul': '0.6.4'
};

Package.onUse(function (api) {
  api.versionsFrom('METEOR@1.6.1');

  api.use(['ecmascript']);
  api.use('webapp', 'server');
  // Add datasets
  api.addAssets('conf/default-coverage.json', 'server');

  api.mainModule('server/index.js', 'server');
  Npm.depends(dependencies);
});
