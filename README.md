[![Build Status](https://travis-ci.org/serut/meteor-coverage.png?branch=master)](https://travis-ci.org/serut/meteor-coverage)

meteor-coverage
=========================

A meteor package that allows you to get the statement, line, function and branch coverage of your meteor project and your meteor package.  

This package uses the [istanbul api](https://github.com/istanbuljs/istanbul-api) package for coverage report and [meteorhacks:picker](https://github.com/meteorhacks/picker) for server side routing.  
It's a debug only package, so it does not affect your production build.

## Installation

In your Meteor app directory, enter:

```bash
$ meteor add lmieulet:meteor-coverage
```
If you have internal packages inside your application, open the file `.meteor/packages` and move the line `lmieulet:meteor-coverage` to be above packages that you want to hook on the server side.

## Global environment variable

You need to set up these environment variables:
* `COVERAGE=1` to enable coverage,
* `COVERAGE_APP_FOLDER=/path/to/your/meteor/application/`  
    * Used to see if you have a customized `.coverage.json` file
    * Used by istanbul in reports if the file has source map
    * Needs to end with a trailing slash
* `COVERAGE_VERBOSE=1` to see logs (optional)

## Get report

Open the page:
```URL
http://localhost:3000/coverage
```

## Send client coverage to server (for the moment, it's your job)

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
If you do not have this file, this package will use the default one (`conf/default-coverage.json`)

## Limitation(s) / open issues


* You see the coverage of processed files if there are no source maps.
* If Meteor creates a source map for a package that you don't have in your `packages` directory, the report will try to read a file that does not exists.
* The client side and the server side are not merged
* No integration with Velocity and tinytest yet. But it's test runners that need to send the client coverage to the server when tests are done. An example of the query that merge the client coverage into the report is available inside `client/methods.js`.
* Integration with coveralls.io, travis-ci, ... ?


## Contributing

Anyone is welcome to contribute.  
Fork, make
and then submit a pull request.
