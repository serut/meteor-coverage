Package.describe({
  name: 'lmieulet:meteor-coverage',
  version: '1.1.0',
  summary: 'Server and client coverage for Meteor',
  git: 'https://github.com/serut/meteor-coverage',
  documentation: 'README.md',
  debugOnly: true // this package is not included on prod
});

Package.onUse(function (api) {
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
  'istanbul-api': '1.1.0-alpha.1',
  'body-parser': '1.15.2',
  'homedir': '0.6.0',
  'minimatch': '3.0.3',
  'mkdirp': '0.5.1',
  'remap-istanbul': '0.6.4'
});

Package.onTest(function (api) {
  api.use('ecmascript');
  api.use(['lmieulet:meteor-coverage-self-instrumenter@3.0.0'], ['server']);
  api.use(['practicalmeteor:mocha', 'practicalmeteor:chai', 'practicalmeteor:sinon', 'lmieulet:meteor-coverage']);
  api.use('jquery', 'client');

  api.mainModule('server/tests.js', 'server');
  api.mainModule('client/main.tests.js', 'client');
});
