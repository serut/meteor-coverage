[![Build Status](https://travis-ci.org/serut/meteor-coverage.png?branch=master)](https://travis-ci.org/serut/meteor-coverage)
[![Coverage Status](https://coveralls.io/repos/github/serut/meteor-coverage/badge.svg?branch=master)](https://coveralls.io/github/serut/meteor-coverage?branch=master)

meteor-coverage
=========================

A meteor package that allows you to get the statement, line, function and branch coverage of Meteor project and package.  
This package uses the [istanbuljs/istanbul-api](https://github.com/istanbuljs/istanbul-api) package for coverage report and [meteorhacks:picker](https://github.com/meteorhacks/picker) for server side routing.  
It's a debug only package, so it does not affect your production build.

## Installation

In your Meteor app directory, enter:

```bash
$ meteor add lmieulet:meteor-coverage
$ COVERAGE=1 \
COVERAGE_VERBOSE=1 \
COVERAGE_APP_FOLDER=/path/to/your/meteor/app/ meteor
```

And open this page to see the report:
```URL
http://localhost:3000/coverage
```

If you have internal packages inside your app and you want to hook their server side js, open the file `.meteor/packages` and move the line `lmieulet:meteor-coverage` to be above these packages.

If you have packages used by your project (ex: aldeed:simple-schema) or libraries on your client side (ex: OpenLayers, Jquery), you can hide the coverage of these files of your report. See [config file](#config-file)

## Global environment variable

You need to set up these environment variables:
* `COVERAGE=1` to enable coverage
* `COVERAGE_APP_FOLDER=/path/to/your/meteor/app/`  
    * Used to see if you have a customized `.coverage.json` file
    * Used by istanbul in reports if the file has source map
    * Needs to end with a trailing slash
    * Used when importing or exporting coverage reports
* `COVERAGE_VERBOSE=1` to see logs (optional)

## Continuous Integration


See the .travis.yml of this real example of Meteor application [meteor-coverage-app-exemple](https://github.com/serut/meteor-coverage-app-exemple) to see how a test runner can execute yours tests, save coverage and send it to coveralls. Works for test package (tinytest, mocha) & mocha test Meteor apps (unit, --full-app). Using `spacejam --coverage` you do not have to set up global environment variable.

## Client API

#### Meteor.sendCoverage(callback)

Run the following command in your browser and the client coverage will be saved into the `COVERAGE_APP_FOLDER` folder.  
```js
    Meteor.sendCoverage(function(stats,err) {console.log(stats,err);});
```
When a browser opens the client side of your application, this package intercept all queries matching `*.js` to respond the instrumented version of the original script. All these instrumented scripts are autonomous and they save the coverage in a global variable when you execute a line of a file. This global variable needs to be sent back to the server to create a full coverage report.

#### Meteor.exportCoverage(type, callback)
* type: the type of report you want to create inside your `COVERAGE_APP_FOLDER`
    * Default: `coverage`, used to dump the coverage object in a file because when there are several types of test, we want to merge results, and the server reloads between each one.
    * Allowed values: `cobertura`, `html`, `json`, `json-summary`, `lcov`, `none`, `teamcity`, `text`, `text-lcov`, `text-summary`, `lcovonly`, `coverage`
    * **Working values:** `lcovonly`, `coverage`
    * Except for `coverage`, the file generation is handled by  [istanbuljs/istanbul-reports](https://github.com/istanbuljs/istanbul-reports)
    * PR welcome

```js
    Meteor.exportCoverage(null, function(err) {console.log(err)})
```
#### Meteor.importCoverage(callback)
Import a `coverage` export.

```js
Meteor.importCoverage(function(err) {console.log(err)})
```

## Config file

You can specify which files will not be covered in reports in a `.coverage.json` file inside the `COVERAGE_APP_FOLDER` folder.
```json
{
  "ignore": {
    "clientside": {
      "inapp": [

      ],
      "public": [
      ]
    },
    "serverside": [
    ]
  }
}
```
If you do not have this file, this package will use the default one (`conf/default-coverage.json`).

To create your custom config file, run the project with COVERAGE_VERBOSE=1 env variable and use logs to see which filenames were hooked or hidden. PR welcome.

## Limitation(s) / open issues

* Tests files are covered - they need to be ignored
* CircleCI support
* `meteor --settings` support
* Cannot control the name of files reports
* A lot of new filters have been added recently, needs to create corresponding entry in the configuration file.

## Contributing

Anyone is welcome to contribute.  
Fork, make and then submit a pull request.

## Credits

This package would not exist without the amazing work of:
* [Xolv.io](http://xolv.io) and their work on the original [meteor-coverage](https://github.com/xolvio/meteor-coverage) package;
* All contributors of [istanbul-api](https://github.com/istanbuljs/istanbul-api) and [istanbul-middleware](https://github.com/gotwarlost/istanbul-middleware) projects.

Both were very helpful in the development of this package. It saves me so many hours so many thanks to them.
