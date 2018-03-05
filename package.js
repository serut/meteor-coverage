Package.describe({
  name: 'lmieulet:meteor-coverage',
  version: '1.1.4',
  summary: 'Server and client coverage for Meteor',
  git: 'https://github.com/serut/meteor-coverage',
  documentation: 'README.md',
  debugOnly: true // this package is not included on prod
});

Package.onUse(function (api) {
  api.versionsFrom('METEOR@1.6');
  api.use(['meteorhacks:picker@1.0.3'], 'server');

  api.use(['ecmascript']);
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
});


Npm.depends({
  'istanbul-lib-source-maps': '1.2.2',
  'istanbul-lib-instrument': '1.9.1',
  'istanbul-lib-hook': '1.1.0',
  'istanbul-lib-coverage': '1.1.1',
  'istanbul-lib-report': '1.1.2',
  'istanbul-reports': '1.1.3',
  'body-parser': '1.18.2',
  'minimatch': '3.0.4',
  'mkdirp': '0.5.1',
  'homedir': '0.6.0',
  'remap-istanbul': '0.6.4'
});


Package.onTest(function (api) {
  api.use('ecmascript');
  api.use(['lmieulet:meteor-coverage-self-instrumenter@3.0.0'], ['server']);
  // use the right version of coffeescript https://github.com/meteor/meteor/issues/8577#issuecomment-341354360
  api.use(['coffeescript@1.12.7_3']);
  api.use(['practicalmeteor:mocha', 'practicalmeteor:chai', 'practicalmeteor:sinon', 'lmieulet:meteor-coverage']);
  api.use('jquery', 'client');

  api.mainModule('server/tests.js', 'server');
  api.mainModule('client/main.tests.js', 'client');
});
