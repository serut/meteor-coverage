[![Build Status](https://travis-ci.org/serut/meteor-coverage.png?branch=master)](https://travis-ci.org/serut/meteor-coverage)

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


## Client API

See this [spacejam fork](https://github.com/serut/spacejam/commit/8cd3be8b4566f473de716531d07daad719a511f0#diff-d996d1b7a7cbf9674912e74ab1f89d0bR52) to see a real example of a test runner that save the coverage into lcovonly format.

#### Meteor.sendCoverage(callback)

Run the following command in your browser and the client coverage will be saved into the server  
```js
    Meteor.sendCoverage(function(stats,err) {console.log(stats,err);});
```
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


* The current version of Meteor does not create a source maps for every js file during a local build. Sadness when you cannot see the coverage of your local package.
* Error with web report: Unable to lookup source
    * HTML templates are processed into js files, and currently we have no way to detect and remove these files from coverage because they look like any other js file. That's why a template `foo.html` will exists in report as `template.foo.js`.
    * If you use a Meteor application depends on a package that you don't have in your `packages` directory, the report will try to read a file that does not exists.

## Contributing

Anyone is welcome to contribute.  
Fork, make and then submit a pull request.
