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
COVERAGE_APP_FOLDER=/path/to/dir meteor
```

And open this page to see the report:
```URL
http://localhost:3000/coverage
```

If you have internal packages inside your application, open the file `.meteor/packages` and move the line `lmieulet:meteor-coverage` to be above packages that you want to hook on the server side.

If you have packages used by your project or libraries on your client side, you can hide the coverage of these files of your report. See [config file](#config-file)

## Global environment variable

You need to set up these environment variables:
* `COVERAGE=1` to enable coverage
* `COVERAGE_APP_FOLDER=/path/to/your/meteor/application/`  
    * Used to see if you have a customized `.coverage.json` file
    * Used by istanbul in reports if the file has source map
    * Needs to end with a trailing slash
* `COVERAGE_VERBOSE=1` to see logs (optional)


## Client API

Run the following command in your browser and the coverage will be updated  
```js
    Meteor.sendCoverage(function(stats) {console.log(stats);});
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
    "serverside": {

    }
  }
}
```
If you do not have this file, this package will use the default one (`conf/default-coverage.json`).

To create your custom config file, run the project with COVERAGE_VERBOSE=1 env variable and use logs to see which filenames were hooked or hidden. PR welcome.

## Limitation(s) / open issues


* The current version of Meteor does not create a source maps for every js file during a local build. Sadness when you cannot see the coverage of your local package.
* The integration with test runner is not done. The test runners, maybe phantomjs ?, will need to
    * Send the client coverage to the server when a test is done - OK
    * Save the coverage report on the fs
    * reading an existing coverage report on the fs and then merge it, because test runners execute several types of tests and we want to merge results
*Error with web report: Unable to lookup source
    * HTML templates are processed into js files, and currently we have no way to remove these files from coverage because they look like any other js file. That's why a template `foo.html` will exists in report as `template.foo.js`.
     * If you use a package that you don't have in your `packages` directory, the report will try to read a file that does not exists.

## Contributing

Anyone is welcome to contribute.  
Fork, make and then submit a pull request.
