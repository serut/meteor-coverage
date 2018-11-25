# meteor-coverage

A meteor package that allows you to get the statement, line, function and branch coverage of Meteor project and package.

This package uses the [istanbuljs](https://github.com/istanbuljs/istanbuljs) set of packages to generate reports. Starting from Meteor 1.8, this package does not instrument your code to get coverage as you can let babel do it using the [babel plugin istanbul](https://github.com/istanbuljs/babel-plugin-istanbul).

It's a debug only package, so it does not affect your production build.

## CI Platforms supported

|                                                                                       |                                                                         Travis                                                                        |                                                                                                                                          Circle CI |                                                                                                                                                                                      Coveralls |                                                                                                                                                      Codecov |                                                                                                                                                                                                                                                                                                       Codacy |
| ------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------: | -------------------------------------------------------------------------------------------------------------------------------------------------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | -----------------------------------------------------------------------------------------------------------------------------------------------------------: | -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| lmieulet:meteor-coverage                                                              |             [![Build Status](https://travis-ci.org/serut/meteor-coverage.png?branch=master)](https://travis-ci.org/serut/meteor-coverage)             |                         [![Circle CI](https://circleci.com/gh/serut/meteor-coverage.svg?style=svg)](https://circleci.com/gh/serut/meteor-coverage) |                         [![Coverage Status](https://coveralls.io/repos/github/serut/meteor-coverage/badge.svg?branch=master)](https://coveralls.io/github/serut/meteor-coverage?branch=master) |                         [![codecov](https://codecov.io/gh/serut/meteor-coverage/branch/master/graph/badge.svg)](https://codecov.io/gh/serut/meteor-coverage) | [![Codacy Badge](https://api.codacy.com/project/badge/Grade/3679340dded44b84a44ca65862855216)](https://www.codacy.com/app/l-mieulet/meteor-coverage) [![Codacy Badge](https://api.codacy.com/project/badge/Coverage/3679340dded44b84a44ca65862855216)](https://www.codacy.com/app/l-mieulet/meteor-coverage) |
| [meteor-coverage-app-exemple](https://github.com/serut/meteor-coverage-app-exemple)   | [![Build Status](https://travis-ci.org/serut/meteor-coverage-app-exemple.svg?branch=master)](https://travis-ci.org/serut/meteor-coverage-app-exemple) | [![Circle CI](https://circleci.com/gh/serut/meteor-coverage-app-exemple.svg?style=svg)](https://circleci.com/gh/serut/meteor-coverage-app-exemple) | [![Coverage Status](https://coveralls.io/repos/github/serut/meteor-coverage-app-exemple/badge.svg?branch=master)](https://coveralls.io/github/serut/meteor-coverage-app-exemple?branch=master) | [![codecov](https://codecov.io/gh/serut/meteor-coverage-app-exemple/branch/master/graph/badge.svg)](https://codecov.io/gh/serut/meteor-coverage-app-exemple) |                                                                                                                                            [![Codacy Badge](https://api.codacy.com/project/badge/Grade/1a2997c614cf4da09452f47d70d72352)](https://www.codacy.com/app/l-mieulet/meteor-coverage-app-exemplee) |


[![Dependency Status](https://img.shields.io/david/serut/meteor-coverage.svg)](https://david-dm.org/serut/meteor-coverage)
[![devDependency Status](https://img.shields.io/david/dev/serut/meteor-coverage.svg)](https://david-dm.org/serut/meteor-coverage?type=dev)


## Compatibility

| meteor-coverage | Meteor | spacejam & practicalmeteor | meteortesting:mocha |
| ------------- |:----------:|:----------:|:----------:|
| 1.x  | <1.6.0 | ✔ | ✘ |
| [not supported](https://github.com/meteor/meteor/issues/9281)  | 1.6.0 <1.6.1 | ✘  | ✘  |
| 2.x      | >=1.6.1 and < 1.8| ✘ | ✔ |
| 3.x      | >=1.8| ✘ | ✔ |

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

- [Installation](#installation)
  - [Specific setup for Meteor apps](#specific-setup-for-meteor-apps)
  - [Specific setup for Meteor package](#specific-setup-for-meteor-package)
- [Advanced setup for CI](#advanced-setup-for-ci)
  - [Coveralls](#coveralls)
  - [Codecov](#codecov)
- [Global environment variable](#global-environment-variable)
- [Config file](#config-file)
- [My files are missing from my app coverage report](#my-files-are-missing-from-my-app-coverage-report)
- [Meteor ignored folders and files](#meteor-ignored-folders-and-files)
- [How to use another test runner](#how-to-use-another-test-runner)
- [I want my reports referred to my original source files](#i-want-my-reports-referred-to-my-original-source-files)
- [Client API](#client-api)
    - [Meteor.sendCoverage(callback)](#meteorsendcoveragecallback)
    - [Meteor.exportCoverage(type, callback)](#meteorexportcoveragetype-callback)
    - [Meteor.importCoverage(callback)](#meteorimportcoveragecallback)
- [Contributing](#contributing)
- [Credits](#credits)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Installation

### Specific setup for Meteor apps

Ensure you use at least Meteor version `v1.8`.

Then, run the following  :

```txt
meteor add lmieulet:meteor-coverage meteortesting:mocha
meteor npm init # If the package.json file does not exist
meteor npm install --save-dev babel-plugin-istanbul
```

In order to instrument your code, you need to add the [`babel-plugin-istanbul`](https://github.com/istanbuljs/babel-plugin-istanbul) to your babel config. If you don't have a babel config file, edit your package.json file, or use [any other babel configuration file (see .babelrc.js)](https://babeljs.io/docs/en/config-files).

```json
{
  "name": "my-package",
  "version": "1.0.0",
  "babel": {
    "env": {
      "COVERAGE": {
        "plugins": [
          "istanbul"
        ]
      }
    }
  }
}
```

You must wrap the istanbul plugin with the `env` setting to disable the file-instrumentation of your project when you are not running the test coverage script. Just keep in mind that if you follow the here under script, babel will use the `istanbul` package only when `NODE_ENV=COVERAGE`.

Now, to run the coverage process, just add these new scripts inside your `package.json` in the root folder of your app:
```json
  "scripts": {
    "coverage:unit": "NODE_ENV=COVERAGE TEST_BROWSER_DRIVER=puppeteer COVERAGE=1 COVERAGE_OUT_HTML=1 COVERAGE_APP_FOLDER=$PWD/ meteor test --once --driver-package meteortesting:mocha",
    "coverage:watch": "NODE_ENV=COVERAGE COVERAGE=1 COVERAGE_VERBOSE=1 COVERAGE_APP_FOLDER=$PWD/ TEST_WATCH=1 meteor test --driver-package meteortesting:mocha"
  }
```

You can find more options on the [meteortesting readme](https://github.com/meteortesting/meteor-mocha#run-with-code-coverage). Let's try the watch mode :

    meteor npm run test:watch:coverage

Now open your [browser test page localhost:3000/](http://localhost:3000/) and the page [localhost:3000/coverage](http://localhost:3000/coverage). You can notice the client coverage is completly missing but server one is there. A missing feature would be to save your client coverage with a widget. Instead, you need to enter this javascript in your browser console (in the page where tests are executed):

    Meteor.sendCoverage(function(stats,nbErr) {console.log(stats,nbErr);});
    # Reopen localhost:3000/coverage to see that client coverage have been saved on server

    # Creates an html export inside coverage_app_folder/output_folder/index.html
    Meteor.exportCoverage("html", function(err) {console.log(err)})
    
Refresh the [localhost:3000/coverage](http://localhost:3000/coverage) in your browser to see there is client coverage now.
    
### Specific setup for Meteor package

In a meteor package, you need to add inside the `package.js` file:  

```js
[...]
Package.onTest(function (api) {
    api.use(['lmieulet:meteor-packages-coverage@0.2.0', 'lmieulet:meteor-coverage@3.0.0','meteortesting:mocha']);
    [...]
});
```

Creating a Meteor package in 2018 is a nightmare, so please stay calm when you discover the following `package.json` that prevents so many issues :
```
  "scripts": {
    "setup-test": "rm -rf ./someapp && meteor create --bare someapp && cd someapp && cp ../.coverage.json . && meteor npm i --save puppeteer && mkdir packages && ln -s ../../ ./packages/meteor-coverage",
    "test": "meteor npm run setup-test && cd someapp && TEST_BROWSER_DRIVER=puppeteer COVERAGE_VERBOSE=1 COVERAGE=1 COVERAGE_OUT_LCOVONLY=1 COVERAGE_APP_FOLDER=$(pwd)/ meteor test-packages --once --driver-package meteortesting:mocha ./packages/meteor-coverage",
    "test:watch": "cd someapp && TEST_WATCH=1 COVERAGE=1 COVERAGE_APP_FOLDER=$(pwd)/ meteor test-packages --driver-package meteortesting:mocha ./packages/meteor-coverage"
  }
```
The task `setup-test` is the cutting edge workaround that creates an empty meteor app that will run your test later.  

## Advanced setup for CI

### Coveralls

Install

    meteor npm i --save-dev coveralls

Add this after tests execution:

    # Send coverage report
    cat .coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js || true # ignore coveralls error

### Codecov

Install

    meteor npm i --save-dev codecov.io

Add this after tests execution:

    cat .coverage/lcov.info | ./node_modules/codecov.io/bin/codecov.io.js || true # ignore codecov error

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

## Config file

If you have packages used by your project (ex: aldeed:simple-schema) or libraries on your client side (ex: OpenLayers, Jquery), you can hide the coverage of these files from reports. You can specify which files will not be covered in a `.coverage.json` file inside the `COVERAGE_APP_FOLDER` folder.

If you do not have this file, this package will use the default one (`conf/default-coverage.json`). If you do not define a key in the `.coverage.json` file, the default one will be used.

Exemple:  

```json{
  "--": "Meteor app does not require any specific configuration",
  "--": "If you want to instrument a package, you need to add the following",
  "remapFormat": ["html", "cobertura", "clover", "json", "json-summary", "lcovonly", "teamcity", "text", "text-summary"],
  "output": "./.coverage"
}
```

Details :

-   The glob syntax can be found [here](http://www.linuxjournal.com/content/bash-extended-globbing).
-   To create your custom config file, run the project with `COVERAGE_VERBOSE=1` env variable and use logs to see which filenames were hooked or hidden. PR welcome.
-   The output folder needs to starts with a dot to exclude that folder from Meteor build.

## My files are missing from my app coverage report

If you have **internal packages** inside your app and you want to get their **server side** coverage. Open the file `.meteor/packages` and move the line `lmieulet:meteor-coverage` to be above these packages.

## Meteor ignored folders and files

-   hidden folders like .npm, .coverage or .meteor.
-   special folders like node_modules.
-   all meteor packages (bundled and/or manually installed ones) like meteor/underscore, meteor/accounts-password or aldeed:simple-schema.
-   all tests file(s) containing `spec?|test?|specs?|tests?|app-specs?|app-tests?`  and all folder(s) named `specs?|tests?|app-specs?|app-tests?`

## How to use another test runner

You can find [here](https://github.com/practicalmeteor/spacejam/compare/windows-suppport...serut:windows-suppport-rc4?diff=split&name=windows-suppport-rc4#diff-f388d8f4ed9765929079f40166396fdeR65) the diff between "spacejam without coverage" and "spacejam coverage", so you can build something else,  with grunt for example, that exports your test. meteortesting:mocha did also the same.

## I want my reports referred to my original source files

If you are using a language that compiles to JavaScript (there are [lots of them](https://github.com/jashkenas/coffeescript/wiki/list-of-languages-that-compile-to-js)), you may want to see your coverage reports referred to the original source files (prior to compilation).

To remap your source files, you have to provide the report type `out_remap` explicitly when using `spacejam`: `spacejam-mocha --coverage out_remap`

You'll get your remapped coverage reports at `./.coverage/.remap` (or `custom_output/.remap` if you're customized the output folder through the file `.coverage.json`).

The coverage is remapped to **all the available reports** (listed in the following example) by default. If you only want some of them, you need to request them explicitly through the key `remap.format` in `.coverage.json` like this:

```json
{
  "remap": {
    "format": ["html", "clover", "cobertura", "json", "json-summary", "lcovonly", "teamcity", "text", "text-summary"]
  }
}
```

If you want to remap the coverage with `Meteor.exportCoverage()`, then you must use the report type `remap`.

This feature has only been tested with TypeScript, but it should work for any language compiled to JavaScript, just **make sure you generate source maps (\*.js.map) for all the compiled files and that source maps are located next to their respective compiled JavaScript file (\*.js)**, just like this:

    COVERAGE_APP_FOLDER
    ├── tsconfig.json
    ├── src
    |   ├── my-file.ts
    |   └── my-file.d.ts
    ├── build
    |   ├── my-file.js
    |   └── my-file.js.map

* * *

## Client API

#### Meteor.sendCoverage(callback)

Run the following command in your browser and the client coverage will be saved into the server coverage report.  

```js
Meteor.sendCoverage(function(stats,nbErr) {console.log(stats,nbErr);});
```

Why? When a browser opens the client side of your application, this package intercepts all queries matching `*.js` to respond the instrumented version of the original script, if they are not ignored by the configuration file. All these instrumented scripts are autonomous and they save the coverage in a global variable when you execute a line of a file. This global variable needs to be sent back to the server to create a full coverage report.

#### Meteor.exportCoverage(type, callback)

-   type: the type of report you want to create inside your `COVERAGE_APP_FOLDER`

    -   Default: `coverage`, used to dump the coverage object in a file because when there are several types of test, we want to merge results, and the server reloads between each one.
    -   Allowed values: `coverage`, `html`, `json`, `json-summary`, `lcovonly`, `remap`, `text-summary`
    -   **Not working values:** `clover`, `cobertura`, `lcov`, `teamcity`, `text`, `text-lcov`, PR welcome
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

    # You should fork this repo first
    git clone https://github.com/serut/meteor-coverage
    # I have a preference to always execute npm action
    # throw the integrated meteor npm (npm --v !== meteor npm --v)
    meteor npm install
    # Edit the app_folder key to match your app folder, don't forget the ending slash
    nano settings.coverage.json
    # Then run mocha watch tests
    meteor npm run start

## Credits

This package would not exist without the amazing work of:

-   [Contributors](https://github.com/serut/meteor-coverage/graphs/contributors) and testers for their help
-   [Xolv.io](http://xolv.io) and their work on the original [meteor-coverage](https://github.com/xolvio/meteor-coverage) package;
-   All contributors of [istanbuljs](https://github.com/istanbuljs/istanbuljs) project.

All of them were very helpful in the development of this package. Merci !  
