Package.describe({
  name: 'lmieulet:meteor-coverage',
  version: '0.2.0',
  // Brief, one-line summary of the package.
  summary: 'Server and client coverage for Meteor',
  // URL to the Git repository containing the source code for this package.
  git: 'https://github.com/serut/meteor-coverage',
  // By default, Meteor will default to using README.md for documentation.
  // To avoid submitting documentation, set this field to null.
  documentation: 'README.md',
  debugOnly: true // this package is not included in builds
});

Package.onUse(function(api) {
  api.versionsFrom('METEOR@1.3.1');
  api.use(['ecmascript', 'meteorhacks:picker@1.0.3', 'underscore'], 'server');


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
    'server/main.js',
  ], 'server');

  api.addFiles([
    'client/methods.js'
  ], 'client');
});


Npm.depends({
  "istanbul-api": "1.0.0-alpha.13",
  'body-parser': '1.15.0'
});

Package.onTest(function (api) {
  api.use('lmieulet:meteor-coverage');
  api.use('jquery', 'client');
  api.use('tinytest');

  api.addFiles([
    'tests/tests.js',
  ]);
});
