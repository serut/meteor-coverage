Package.describe({
  name: 'lmieulet:meteor-coverage',
  version: '4.3.0',
  summary: 'Server and client coverage for Meteor',
  git: 'https://github.com/serut/meteor-coverage',
  documentation: 'README.md',
  debugOnly: true // this package is not included on prod
});

const dependencies = {
  'istanbul-lib-coverage': '2.0.5',
  'istanbul-lib-report': '2.0.8',
  'istanbul-reports': '2.2.7',
  'body-parser': '1.20.2',
  'mkdirp': '0.5.1',
  'remap-istanbul': '0.12.0'
};

Package.onUse(function (api) {
  Npm.depends(dependencies);
  api.versionsFrom(['2.3', '3.0']);

  api.use(['ecmascript', 'webapp', 'http@1.0.0 || 2.0.0']);
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
});


Package.onTest(function (api) {
  Npm.depends({
    ...dependencies,
    'chai': '4.2.0',
    'sinon': '7.1.1',
    'sinon-chai': '3.2.0'
  });
  api.use('ecmascript');
  api.use('lmieulet:meteor-legacy-coverage@0.4.0', 'server');
  api.use(['lmieulet:meteor-coverage@4.3.0']);
  api.use(['meteortesting:mocha@3.0.0']);
  // New meteor 12/2018 unknown issue
  api.addFiles(['client/methods.e2e.tests.js', 'client/methods.unit.tests.js', 'client/client.instrumentation.tests.js'], 'client');
  api.mainModule('server/tests.js', 'server');
  api.mainModule('client/main.tests.js', 'client');
});
