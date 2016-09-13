# meteor-coverage

A meteor package that allows you to get the statement, line, function and branch coverage of Meteor project and package.  
This package uses the [istanbuljs/istanbul-api](https://github.com/istanbuljs/istanbul-api) package for coverage report.  
It's a debug only package, so it does not affect your production build.

## CI Platforms supported

|                                                                                     |                                                                         Travis                                                                        |                                                                                                                                          Circle CI |                                                                                                                                                                                      Coveralls |                                                                                                                                                      Codecov |                                                                                                                                                                                                                                                                                                       Codacy |
| ----------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------: | -------------------------------------------------------------------------------------------------------------------------------------------------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | -----------------------------------------------------------------------------------------------------------------------------------------------------------: | -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| lmieulet:meteor-coverage                                                            |             [![Build Status](https://travis-ci.org/serut/meteor-coverage.png?branch=master)](https://travis-ci.org/serut/meteor-coverage)             |                         [![Circle CI](https://circleci.com/gh/serut/meteor-coverage.svg?style=svg)](https://circleci.com/gh/serut/meteor-coverage) |                         [![Coverage Status](https://coveralls.io/repos/github/serut/meteor-coverage/badge.svg?branch=master)](https://coveralls.io/github/serut/meteor-coverage?branch=master) |                         [![codecov](https://codecov.io/gh/serut/meteor-coverage/branch/master/graph/badge.svg)](https://codecov.io/gh/serut/meteor-coverage) | [![Codacy Badge](https://api.codacy.com/project/badge/Grade/3679340dded44b84a44ca65862855216)](https://www.codacy.com/app/l-mieulet/meteor-coverage) [![Codacy Badge](https://api.codacy.com/project/badge/Coverage/3679340dded44b84a44ca65862855216)](https://www.codacy.com/app/l-mieulet/meteor-coverage) |
| [meteor-coverage-app-exemple](https://github.com/serut/meteor-coverage-app-exemple) | [![Build Status](https://travis-ci.org/serut/meteor-coverage-app-exemple.svg?branch=master)](https://travis-ci.org/serut/meteor-coverage-app-exemple) | [![Circle CI](https://circleci.com/gh/serut/meteor-coverage-app-exemple.svg?style=svg)](https://circleci.com/gh/serut/meteor-coverage-app-exemple) | [![Coverage Status](https://coveralls.io/repos/github/serut/meteor-coverage-app-exemple/badge.svg?branch=master)](https://coveralls.io/github/serut/meteor-coverage-app-exemple?branch=master) | [![codecov](https://codecov.io/gh/serut/meteor-coverage-app-exemple/branch/master/graph/badge.svg)](https://codecov.io/gh/serut/meteor-coverage-app-exemple) |                                                                                                                                            [![Codacy Badge](https://api.codacy.com/project/badge/Grade/1a2997c614cf4da09452f47d70d72352)](https://www.codacy.com/app/l-mieulet/meteor-coverage-app-exemplee) |

## Installation

### Specific setup for Meteor apps

Run the following  :

```txt
meteor add practicalmeteor:mocha lmieulet:meteor-coverage
```


### Specific setup for Meteor package

 In a meteor package, you need to add inside the `package.js` file:  

```js
[...]
Package.onTest(function (api) {
    api.use(['ecmascript', 'practicalmeteor:mocha', 'practicalmeteor:chai', 'practicalmeteor:sinon', 'lmieulet:meteor-coverage@0.9.4']);
[...]
});
```

### Configuration

Configure your working environment :

-   create your configuration file `.coverage.json` to specify what you want to cover.
-   run meteor with one of these options, because meteor-coverage is a probe disabled by default that also requires the absolute path to your source folder. 
    -   use spacejam as a test runner (`serut/spacejam:windows-suppport-rc4`, for now it's only a fork), perfect for CI or prepublish hooks. Spacejam setup everything for you.
    -   OR
    -   use a meteor setting file to store the coverage configuration, like in a `settings.coverage.json`, then just need to run your app with `--settings settings.coverage.json`
    -   OR
    -   set these environment variables : `COVERAGE`, `COVERAGE_VERBOSE` & `COVERAGE_APP_FOLDER`.

-   meteor-coverage ensures the output folder exist on boot, which is by default `./.coverage` inside your app. 


Then test with the following command

    meteor [... see below] --settings settings.coverage.json
    # Open localhost:3000/coverage in your browser
or 

    spacejam [... see below] --coverage [out_html|out_lcovonly|out_text_summary|out_json_report|out_json_summary|in_coverage|out_coverage|]

### Run options 

While spacejam requires mocha, meteor-coverage is agnostic on this point. If the `COVERAGE` flag is true, it instruments your app and provides an HTTP API to generate reports.

These options are supported :

    [run|test|test --full-app|test-packages]

However, you need to run your app with the following driver package :  

    [spacejam|meteor] --driver-package practicalmeteor:mocha-console-runner

If you want to, you can use this syntax, the following two commands are equivalent, but the second one is shorter and thus less typing error-prone

    spacejam test-packages ./ --driver-package practicalmeteor:mocha-console-runner --coverage "out_lcovonly out_html"
    spacejam-mocha test-packages ./ --coverage "out_lcovonly out_html"



## Setup spacejam

If you have any trouble, refer to this example of Meteor application [meteor-coverage-app-exemple](https://github.com/serut/meteor-coverage-app-exemple) to see how a test runner can execute yours tests, save coverage and send it to coveralls. Or feel free to open an issue.


Add the following dependencies in your `package.json`:

    meteor npm i --save-dev https://github.com/serut/spacejam/tarball/windows-suppport-rc4 

Add what you need to run your app inside your `package.json`:

    "scripts": {
        [APP]
        "test": "meteor npm run lint:fix & meteor npm run test:app-unit-coverage & ...",
        "test:app-unit-coverage": "spacejam test                  --driver-package practicalmeteor:mocha-console-runner --coverage out_coverage",
        "test:app-full-coverage": "spacejam test --full-app       --driver-package practicalmeteor:mocha-console-runner --coverage 'in_coverage|out_lcovonly'",
        "test:packages-coverage": "spacejam test-packages   --driver-package practicalmeteor:mocha-console-runner --coverage out_lcovonly"
        
        [PCKGS]
        "test": "spacejam test-packages ./ --coverage out_lcovonly  --driver-package practicalmeteor:mocha-console-runner",
        "test:watch": "meteor npm run lint:fix & meteor npm run test:packages-coverage-watch",
        "test:packages-coverage-watch": "meteor test-packages --driver-package practicalmeteor:mocha --settings settings.coverage.json",
        
        "lint:fix": "eslint --fix ."

    }
## Advanced setup for CI

Now, you can run your test (here is an extract of a [circle.yml](https://github.com/serut/meteor-coverage-app-exemple/blob/master/circle.yml)), merge coverage between tests, export the coverage report and sent it to a coverage platform:

    - meteor npm install
    # Unit test using mocha
    - meteor npm run test-coverage-app-unit
    # Integration test using mocha
    - meteor npm run test-coverage-app-full
    # Package test using mocha
    - meteor npm run test-coverage-packages-mocha
    # Send coverage report
    
### Coveralls

    meteor npm i --save-dev coveralls 
    - cat .coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js || true # ignore coveralls error
    
### Codecov 

    meteor npm i --save-dev codecov.io
    - cat .coverage/lcov.info | ./node_modules/codecov.io/bin/codecov.io.js || true # ignore codecov error

## spacejam --coverage possibilities

-   `out_coverage` creates a dump of the coverage - used when you want to merge several coverage
-   `in_coverage` imports a coverage dump (previously create with `out_coverage`)
-   `out_lcovonly` creates a lcov report
-   `out_html` creates a html report
-   `out_json_report` creates a json report
-   `out_json_summary` creates a json_summary report
-   `out_text_summary` creates a text_summary report
-   `out_teamcity` & `out_clover` are not working yet

## Meteor --settings file

Create the `settings.coverage.json` file with the following:

```json
{
    "coverage": {
        "coverage_app_folder": "C:\\Users\\you\\dev\\meteor-app\\ on windows, or",
        "coverage_app_folder": "/Users/you/meteor-app/packages/meteor-coverage/ on unix",
        "is_coverage_active": true,
        "verbose": false
    }
}
```

Note that `coverage_app_folder : /path/to/your/meteor/app/` requires to end with a trailing slash



## Global environment variable
**Deprecated**
You can provides settings by setting these environment variables:

-   `COVERAGE=1` to enable coverage
-   `COVERAGE_APP_FOLDER=/path/to/your/meteor/app/`  
    -   Used to see if you have a customized `.coverage.json` file
    -   Used by istanbul in reports if the file has source map
    -   Needs to end with a trailing slash
    -   Used when importing or exporting coverage reports
-   `COVERAGE_VERBOSE=1` to see logs (optional)

Using `spacejam --coverage`, `COVERAGE` and `COVERAGE_APP_FOLDER` are setup automatically for you.

## Config file

If you have packages used by your project (ex: aldeed:simple-schema) or libraries on your client side (ex: OpenLayers, Jquery), you can hide the coverage of these files from reports. You can specify which files will not be covered in a `.coverage.json` file inside the `COVERAGE_APP_FOLDER` folder.

If you do not have this file, this package will use the default one (`conf/default-coverage.json`). If you do not define a key in the `.coverage.json` file, the default one will be used.

Exemple:  
```json{
  "include": [
    "**/packages/author_packageName.js"
  ],
  "exclude": {
    "general": [
        "We will keep this one empty to let you easily exclude anything using the glob pattern"
    ],
    "server": [
      "**/.?*/**",
      "**/packages/!(local-test_?*.js)",
      "**/+([^:]):+([^:])/**",
      "**/@(test|tests|spec|specs)/**",
      "**/@(test.?*|?*.test.?*|?*.tests.?*)",
      "**/@(spec.?*|?*.spec.?*|?*.specs.?*)",
      "**/@(app-test.?*|?*.app-test.?*|?*.app-tests.?*)",
      "**/@(app-spec.?*|?*.app-spec.?*|?*.app-specs.?*)"
    ],
    "client": [
      "**/client/stylesheets/**",
      "**/.npm/package/node_modules/**",
      "**/web.browser/packages/**",
      "**/.?*/**",
      "**/packages/!(local-test_?*.js)",
      "**/+([^:]):+([^:])/**",
      "**/@(test|tests|spec|specs)/**",
      "**/@(test.?*|?*.test.?*|?*.tests.?*)",
      "**/@(spec.?*|?*.spec.?*|?*.specs.?*)",
      "**/@(app-test.?*|?*.app-test.?*|?*.app-tests.?*)",
      "**/@(app-spec.?*|?*.app-spec.?*|?*.app-specs.?*)"
    ]
  },
  "output": "./.coverage"
}
```
Details : 

 - Allows / Disallow is coded with the following order `include`, `exclude.general`, `exclude.(client|server)`, it is used before both instrumentation and before coverage report creation.
 - The glob syntax can be found [here](https://github.com/isaacs/node-glob#glob-primer).
 -  To create your custom config file, run the project with `COVERAGE_VERBOSE=1` env variable and use logs to see which filenames were hooked or hidden. PR welcome.
- The output folder needs to starts with a dot to exclude that folder from Meteor build.

### Flow router issue

If you are using flow-router, there are [an issue](https://github.com/kadirahq/flow-router/pull/615) that prevents tests to succeed.  
This workaround replaces flow-router with a patched version which ignores that error: 
```bash
cd packages 
git submodule add https://github.com/serut/flow-router
```

## My files are missing from my app coverage report

If you have **internal packages** inside your app and you want to get their **server side** coverage. Open the file `.meteor/packages` and move the line `lmieulet:meteor-coverage` to be above these packages.

### Istanbul html colors legend

- Pink: statement not covered
- Orange: function not covered
- Yellow: branch not covered
- [I] and [E] in front of if-else statements: if or else not covered respectively
- Branch coverage display only kicks in if one or more but not all branches have been taken (if none of the branches were taken the statement coverage will show you that unambiguously)

## Ignore code from coverage with annotation

For example, if you code an `if` block without `else`, istanbul marks the `else` branch as not covered (although it doesn't exist), decreasing your code coverage, which is **false**.  
Same issue with ternary operator (`expression ? value1 : value2`) or default assignments (like `let myVar = otherVar || {}`), which always get marked as uncovered branches.  

The syntax can be found there:  
https://github.com/gotwarlost/istanbul/blob/master/ignoring-code-for-coverage.md

## Meteor ignored folders and files

- hidden folders like .npm, .coverage or .meteor.
- special folders like node_modules.
- all meteor packages (bundled and/or manually installed ones) like meteor/underscore, meteor/accounts-password or aldeed:simple-schema.
- all tests file(s) containing `spec?|test?|specs?|tests?|app-specs?|app-tests?`  and all folder(s) named `specs?|tests?|app-specs?|app-tests?`


-----------

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
    -   Allowed values: `cobertura`, `html`, `json`, `json-summary`, `lcov`, `teamcity`, `text`, `text-lcov`, `text-summary`, `lcovonly`, `coverage`
    -   **Not working values:** `clover`, `cobertura`, `lcov`, `text`, `text-lcov`, PR welcome
    -   Except for `coverage`, the file generation is handled by  [istanbuljs/istanbul-reports](https://github.com/istanbuljs/istanbul-reports)

```js
Meteor.exportCoverage(null, function(err) {console.log(err)})
```

#### Meteor.importCoverage(callback)

Import a `coverage` export.

```js
Meteor.importCoverage(function(err) {console.log(err)})
```

## Contributing

Anyone is welcome to contribute.  

    git clone https://github.com/serut/meteor-coverage
    # I have a preference for the meteor node
    meteor npm install 
    # Edit the app_folder key to match your app folder, don't forget the ending slash
    nano settings.coverage.json
    # Then run mocha watch tests
    meteor npm run start


## Credits

This package would not exist without the amazing work of:
-   [Contributors](https://github.com/serut/meteor-coverage/graphs/contributors) and testers for their help
-   [Xolv.io](http://xolv.io) and their work on the original [meteor-coverage](https://github.com/xolvio/meteor-coverage) package;
-   All contributors of [istanbul-api](https://github.com/istanbuljs/istanbul-api) and [istanbul-middleware](https://github.com/gotwarlost/istanbul-middleware) projects.

All of them were very helpful in the development of this package. 
