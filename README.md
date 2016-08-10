# meteor-coverage

A meteor package that allows you to get the statement, line, function and branch coverage of Meteor project and package.  
This package uses the [istanbuljs/istanbul-api](https://github.com/istanbuljs/istanbul-api) package for coverage report and [meteorhacks:picker](https://github.com/meteorhacks/picker) for server side routing.  
It's a debug only package, so it does not affect your production build.

## CI Platforms supported

|                                                                                     |                                                                         Travis                                                                        |                                                                                                                                          Circle CI |                                                                                                                                                                                      Coveralls |                                                                                                                                                      Codecov |                                                                                                                                                                                                                                                                                                       Codacy |
| ----------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------: | -------------------------------------------------------------------------------------------------------------------------------------------------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | -----------------------------------------------------------------------------------------------------------------------------------------------------------: | -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| lmieulet:meteor-coverage                                                            |             [![Build Status](https://travis-ci.org/serut/meteor-coverage.png?branch=master)](https://travis-ci.org/serut/meteor-coverage)             |                         [![Circle CI](https://circleci.com/gh/serut/meteor-coverage.svg?style=svg)](https://circleci.com/gh/serut/meteor-coverage) |                         [![Coverage Status](https://coveralls.io/repos/github/serut/meteor-coverage/badge.svg?branch=master)](https://coveralls.io/github/serut/meteor-coverage?branch=master) |                         [![codecov](https://codecov.io/gh/serut/meteor-coverage/branch/master/graph/badge.svg)](https://codecov.io/gh/serut/meteor-coverage) | [![Codacy Badge](https://api.codacy.com/project/badge/Grade/3679340dded44b84a44ca65862855216)](https://www.codacy.com/app/l-mieulet/meteor-coverage) [![Codacy Badge](https://api.codacy.com/project/badge/Coverage/3679340dded44b84a44ca65862855216)](https://www.codacy.com/app/l-mieulet/meteor-coverage) |
| [meteor-coverage-app-exemple](https://github.com/serut/meteor-coverage-app-exemple) | [![Build Status](https://travis-ci.org/serut/meteor-coverage-app-exemple.svg?branch=master)](https://travis-ci.org/serut/meteor-coverage-app-exemple) | [![Circle CI](https://circleci.com/gh/serut/meteor-coverage-app-exemple.svg?style=svg)](https://circleci.com/gh/serut/meteor-coverage-app-exemple) | [![Coverage Status](https://coveralls.io/repos/github/serut/meteor-coverage-app-exemple/badge.svg?branch=master)](https://coveralls.io/github/serut/meteor-coverage-app-exemple?branch=master) | [![codecov](https://codecov.io/gh/serut/meteor-coverage-app-exemple/branch/master/graph/badge.svg)](https://codecov.io/gh/serut/meteor-coverage-app-exemple) |                                                                                                                                            [![Codacy Badge](https://api.codacy.com/project/badge/Grade/1a2997c614cf4da09452f47d70d72352)](https://www.codacy.com/app/l-mieulet/meteor-coverage-app-exemplee) |

## Installation

-   In a Meteor app, add these dependencies to your `.meteor/packages` file :

```txt
practicalmeteor:chai
practicalmeteor:mocha@2.4.5_5
practicalmeteor:mocha-console-runner
lmieulet:meteor-coverage@0.9.1
```

-   If you are using flow-router, there are [an issue](https://github.com/kadirahq/flow-router/pull/615) that prevents tests to succeed.
-   If you want to cover a package, you need to add `api.use(['lmieulet:meteor-coverage@0.9.1']);` to your `Package.onTest` function of the `package.js` file.

#### Then test if it works

You need to set up environment variable (for now) if you want this package to be active and to process all yours files. Using these instructions, try to run your app and check if it looks good when you open the report page:

```URL
Windows$ SET COVERAGE 1
         SET COVERAGE_VERBOSE 1 # if you have trouble
         SET COVERAGE_APP_FOLDER C:\Users\john\meteor-app\ # With ending slash
         meteor

Others $ COVERAGE=1 \
         COVERAGE_VERBOSE=1 \
         COVERAGE_APP_FOLDER=/path/to/your/meteor/app/ meteor

# 1. Open your app http://localhost:3000/
#    Open the console (F12) and execute
#    Meteor.sendCoverage(function(stats,err) {console.log(stats,err);});
#    It just sends the client coverage (stored in a global variable) to the server
# 2. See the coverage report http://localhost:3000/coverage
```

## Go further with meteor app (CI, reports..)

This is still in an **early phase**, it works for test package (mocha) & mocha test on Meteor apps (unit, --full-app). If you have any trouble, refer to this example of Meteor application [meteor-coverage-app-exemple](https://github.com/serut/meteor-coverage-app-exemple) to see how a test runner can execute yours tests, save coverage and send it to coveralls. Or feel free to open an issue.

For app, edit your `package.json` with the following

    {
    "devDependencies": {
        [...]
        "spacejam": "https://github.com/serut/spacejam/tarball/windows-suppport-rc4",
        "coveralls": "^2.11.11",
        "codecov.io": "^0.1.6"
    },
    {
    "scripts": {
        [...]
        "test-coverage-app-unit": "spacejam test                  --driver-package practicalmeteor:mocha-console-runner --coverage out_coverage",
        "test-coverage-app-full": "spacejam test --full-app       --driver-package practicalmeteor:mocha-console-runner --coverage 'in_coverage|out_lcovonly'",
        "test-coverage-packages-mocha": "spacejam test-packages   --driver-package practicalmeteor:mocha-console-runner --coverage out_lcovonly"
    },
    "devDependencies": {
        [...]
        "spacejam": "https://github.com/serut/spacejam/tarball/windows-suppport-rc4",
        "coveralls": "^2.11.11",
        "codecov.io": "^0.1.6"
    },

Now, you can run your test (here is an extract of a [circle.yml](https://github.com/serut/meteor-coverage-app-exemple/blob/master/circle.yml)), merge coverage between tests, export the coverage report and sent it to a coverage platform:

    - meteor npm install
    # Unit test using mocha
    - meteor npm run test-coverage-app-unit
    # Integration test using mocha
    - meteor npm run test-coverage-app-full
    # Package test using mocha
    - meteor npm run test-coverage-packages-mocha
    # Send coverage report
    - cat lcov.info | ./node_modules/coveralls/bin/coveralls.js || true # ignore coveralls error
    - cat lcov.info | ./node_modules/codecov.io/bin/codecov.io.js || true # ignore codecov error

For packages, install spacejam globally and run it manually (as this package does).

    npm install -g https://github.com/serut/spacejam/tarball/windows-suppport-rc4
    spacejam test-packages ./ --coverage out_lcovonly

## spacejam --coverage possibilities

-   `out_coverage` creates a dump of the coverage - used when you want to merge several coverage
-   `in_coverage` imports a coverage dump (previously create with `out_coverage`)
-   `out_lcovonly` creates a lcov report
-   `out_html` creates a html report
-   `out_json_report` creates a json report
-   `out_json_summary` creates a json_summary report
-   `out_teamcity` is not working yet

## Global environment variable

You need to set up these environment variables:

-   `COVERAGE=1` to enable coverage
-   `COVERAGE_APP_FOLDER=/path/to/your/meteor/app/`  
    -   Used to see if you have a customized `.coverage.json` file
    -   Used by istanbul in reports if the file has source map
    -   Needs to end with a trailing slash
    -   Used when importing or exporting coverage reports
-   `COVERAGE_VERBOSE=1` to see logs (optional)

Using `spacejam --coverage` you do not have to set up global environment variable.

## My files are missing from my app coverage report

If you have **internal packages** inside your app and you want to get their **server side** coverage. Open the file `.meteor/packages` and move the line `lmieulet:meteor-coverage` to be above these packages.

## Config file

If you have packages used by your project (ex: aldeed:simple-schema) or libraries on your client side (ex: OpenLayers, Jquery), you can hide the coverage of these files from reports. You can specify which files will not be covered in a `.coverage.json` file inside the `COVERAGE_APP_FOLDER` folder.

If you do not have this file, this package will use the default one (`conf/default-coverage.json`). If you do not define a key in the `.coverage.json` file, the default one will be used.

Copy the `conf/default-coverage.json`, rename it into `.coverage.json`, remove keys that you don't want to overwrite and pimp it.

```json
{
    "ignore": {
        "clientside": {
            "inapp": [
                "You may want to ignore here modules from client side instrumentation",
                "to get the lightest version of your browser app",
                "/underscore.js",
                "/meteor.js",
                "...",
                "And even dependencies / internal packages:",
                "/lmieulet_meteor-coverage.js",
                "==> if you cloned that package into your package directory",
                "it will ignores all files stored in packages/meteor-coverage/* from client instrumentation"
            ],
            "public": [
                "if you have js in your public directory like",
                "openlayers.min.js",  
                "==> stored in public/openlayers.min.js",
                "and you don't want to instrument them"
            ]
        },
        "serverside": [
        ],
        "others": [
            "here you can ignore any file from your project coverage report",
            ".*/tests/.*.js"
        ]
    },
    "output": "./.coverage"
}
```

To create your custom config file, run the project with `COVERAGE_VERBOSE=1` env variable and use logs to see which filenames were hooked or hidden. PR welcome.

## Client API

#### Meteor.sendCoverage(callback)

Run the following command in your browser and the client coverage will be saved into the server coverage report.  

```js
Meteor.sendCoverage(function(stats,err) {console.log(stats,err);});
```

Why? When a browser opens the client side of your application, this package intercepts all queries matching `*.js` to respond the instrumented version of the original script, if they are not ignored by the configuration file. All these instrumented scripts are autonomous and they save the coverage in a global variable when you execute a line of a file. This global variable needs to be sent back to the server to create a full coverage report.

#### Meteor.exportCoverage(type, callback)

-   type: the type of report you want to create inside your `COVERAGE_APP_FOLDER`
    -   Default: `coverage`, used to dump the coverage object in a file because when there are several types of test, we want to merge results, and the server reloads between each one.
    -   Allowed values: `cobertura`, `html`, `json`, `json-summary`, `lcov`, `none`, `teamcity`, `text`, `text-lcov`, `text-summary`, `lcovonly`, `coverage`
    -   **Working values:** `lcovonly`, `coverage`
    -   Except for `coverage`, the file generation is handled by  [istanbuljs/istanbul-reports](https://github.com/istanbuljs/istanbul-reports)
    -   PR welcome

```js
Meteor.exportCoverage(null, function(err) {console.log(err)})
```

#### Meteor.importCoverage(callback)

Import a `coverage` export.

```js
Meteor.importCoverage(function(err) {console.log(err)})
```

## Limitation(s) / open issues

-   `meteor --settings` support
-   Need to add options when exporting
-   No feedback from typescript and coffeescript users

## Contributing

Anyone is welcome to contribute.  
Fork meteor-coverage-app-exemple, make and then submit a pull request.

Don't forget to test :

-   set environment variables `COVERAGE` and `COVERAGE_APP_FOLDER` (e.g. `set COVERAGE 1` or `COVERAGE=1`)
-   meteor test-packages

## Credits

This package would not exist without the amazing work of:

-   [Xolv.io](http://xolv.io) and their work on the original [meteor-coverage](https://github.com/xolvio/meteor-coverage) package;
-   All contributors of [istanbul-api](https://github.com/istanbuljs/istanbul-api) and [istanbul-middleware](https://github.com/gotwarlost/istanbul-middleware) projects.

Both were very helpful in the development of this package. It saves me so many hours so many thanks to them.
.
