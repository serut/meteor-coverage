Package.describe({
  name: 'lmieulet:meteor-coverage',
  version: '3.1.1',
  summary: 'Server and client coverage for Meteor',
  git: 'https://github.com/serut/meteor-coverage',
  documentation: 'README.md',
  debugOnly: true // this package is not included on prod
});

const dependencies = {
  'istanbul-lib-coverage': '2.0.1',
  'istanbul-lib-report': '2.0.2',
  'istanbul-reports': '2.0.1',
  'body-parser': '1.18.3',
  'mkdirp': '0.5.1',
  'remap-istanbul': '0.6.4'
};

Package.onUse(function (api) {
  api.versionsFrom('METEOR@1.8');

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
    'assets/sorter.js',
    'assets/block-navigation.js'
  ], 'server');

  api.mainModule('server/index.js', 'server');
  api.mainModule('client/methods.js', 'client');
  Npm.depends(dependencies);
});


Package.onTest(function (api) {
  api.use('ecmascript');
  api.use('lmieulet:meteor-packages-coverage@0.2.0', 'server');
  api.use('http', 'client');
  api.use('webapp', 'server');
  api.use(['lmieulet:meteor-coverage']);
  api.use(['meteortesting:mocha']);
  // New meteor 12/2018 unknown issue
  api.addFiles(['client/methods.e2e.tests.js', 'client/methods.unit.tests.js', 'client/client.instrumentation.tests.js'], 'client');
  api.mainModule('server/tests.js', 'server');
  api.mainModule('client/main.tests.js', 'client');

  Npm.depends({
    ...dependencies,
    'chai': '4.2.0',
    'sinon': '7.1.1',
    'sinon-chai': '3.2.0'
  });
});
