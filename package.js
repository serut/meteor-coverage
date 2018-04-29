Package.describe({
  name: 'lmieulet:meteor-coverage',
  version: '2.0.2',
  summary: 'Server and client coverage for Meteor',
  git: 'https://github.com/serut/meteor-coverage',
  documentation: 'README.md',
  debugOnly: true // this package is not included on prod
});

const dependencies = {
  'istanbul-lib-source-maps': '1.2.4',
  'istanbul-lib-instrument': '1.10.0',
  'istanbul-lib-hook': '1.2.0',
  'istanbul-lib-coverage': '1.2.0',
  'istanbul-lib-report': '1.1.4',
  'istanbul-reports': '1.2.0',
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
  api.use('http', 'client');
  // Add datasets
  api.addAssets('conf/default-coverage.json', 'server');

  // Istanbul assets files - because we do not have the link to these files anymore in the istanbul v1.0
  api.addAssets([
    'assets/vendor/prettify.css',
    'assets/vendor/prettify.js',
    'assets/base.css',
    'assets/sort-arrow-sprite.png',
    'assets/sorter.js'
  ], 'server');

  api.mainModule('server/index.js', 'server');
  api.mainModule('client/methods.js', 'client');
  Npm.depends(dependencies);
});


Package.onTest(function (api) {
  api.use('ecmascript');
  api.use(['lmieulet:meteor-coverage-self-instrumenter@4.0.0'], ['server']);
  api.use('http', 'client');
  api.use('webapp', 'server');
  api.use(['lmieulet:meteor-coverage']);
  api.use(['meteortesting:mocha']);

  api.mainModule('server/tests.js', 'server');
  api.mainModule('client/main.tests.js', 'client');

  Npm.depends({
    ...dependencies,
    'chai': '2.1.0',
    'selenium-webdriver': '3.0.0-beta-2',
    'chromedriver': '2.38.2'
  });
});
