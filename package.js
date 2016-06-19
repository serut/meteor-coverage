Package.describe({
  name: 'lmieulet:meteor-coverage',
  version: '0.8.0',
  summary: 'Server and client coverage for Meteor',
  git: 'https://github.com/serut/meteor-coverage',
  documentation: 'README.md',
  debugOnly: true // this package is not included on prod
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@1.3.1');
  api.use(['ecmascript', 'meteorhacks:picker@1.0.3'], 'server');

  api.use("modules");
  // Add datasets
  api.addAssets('conf/default-coverage.json', 'server');

  // Istanbul assets files - because we do not have the link to these files anymore in the istanbul v1.0
  api.addAssets([
    'assets/vendor/prettify.css',
    'assets/vendor/prettify.js',
    'assets/base.css',
    'assets/sort-arrow-sprite.png',
    'assets/sorter.js']
      , 'server');

  api.addFiles([
    'server/log.js',
    'server/conf.js',
    'server/core.js',
    'server/handlers.js',
    'server/routes.js',
    'server/instrumenter.js',
    'server/source-map.js',
    'server/coverage-data.js',
    'server/main.js',
  ], 'server');

  api.addFiles([
    'client/methods.js'
  ], 'client');

  api.export(["MeteorCoverage"], 'server');
});


Npm.depends({
  "istanbul-api": "1.0.0-alpha.13",
  'body-parser': '1.15.1'
});

Package.onTest(function (api) {
  api.use(['lmieulet:meteor-coverage-self-instrumenter@2.0.0'], ['server']);
  api.use('ecmascript');
  api.use(['lmieulet:meteor-coverage', 'tinytest'], ['server', 'client']);
  api.use('jquery', 'client');

  api.addFiles('tests/client/methods.js', 'client');
  api.addFiles([
      'tests/server/tests.js',
      'tests/server/instrumenter.tests.js'
  ], 'server');
});
