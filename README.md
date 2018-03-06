# meteor-coverage

A meteor package that allows you to get the statement, line, function and branch coverage of Meteor project and package.

This package uses the [istanbuljs](https://github.com/istanbuljs/istanbuljs) packages for coverage report.

It's a debug only package, so it does not affect your production build.

## CI Platforms supported

|                                                                                       |                                                                         Travis                                                                        |                                                                                                                                          Circle CI |                                                                                                                                                                                      Coveralls |                                                                                                                                                      Codecov |                                                                                                                                                                                                                                                                                                       Codacy |
| ------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------: | -------------------------------------------------------------------------------------------------------------------------------------------------: | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: | -----------------------------------------------------------------------------------------------------------------------------------------------------------: | -----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
| lmieulet:meteor-coverage                                                              |             [![Build Status](https://travis-ci.org/serut/meteor-coverage.png?branch=master)](https://travis-ci.org/serut/meteor-coverage)             |                         [![Circle CI](https://circleci.com/gh/serut/meteor-coverage.svg?style=svg)](https://circleci.com/gh/serut/meteor-coverage) |                         [![Coverage Status](https://coveralls.io/repos/github/serut/meteor-coverage/badge.svg?branch=master)](https://coveralls.io/github/serut/meteor-coverage?branch=master) |                         [![codecov](https://codecov.io/gh/serut/meteor-coverage/branch/master/graph/badge.svg)](https://codecov.io/gh/serut/meteor-coverage) | [![Codacy Badge](https://api.codacy.com/project/badge/Grade/3679340dded44b84a44ca65862855216)](https://www.codacy.com/app/l-mieulet/meteor-coverage) [![Codacy Badge](https://api.codacy.com/project/badge/Coverage/3679340dded44b84a44ca65862855216)](https://www.codacy.com/app/l-mieulet/meteor-coverage) |
| [meteor-coverage-app-exemple](https://github.com/serut/meteor-coverage-app-exemple)   | [![Build Status](https://travis-ci.org/serut/meteor-coverage-app-exemple.svg?branch=master)](https://travis-ci.org/serut/meteor-coverage-app-exemple) | [![Circle CI](https://circleci.com/gh/serut/meteor-coverage-app-exemple.svg?style=svg)](https://circleci.com/gh/serut/meteor-coverage-app-exemple) | [![Coverage Status](https://coveralls.io/repos/github/serut/meteor-coverage-app-exemple/badge.svg?branch=master)](https://coveralls.io/github/serut/meteor-coverage-app-exemple?branch=master) | [![codecov](https://codecov.io/gh/serut/meteor-coverage-app-exemple/branch/master/graph/badge.svg)](https://codecov.io/gh/serut/meteor-coverage-app-exemple) |                                                                                                                                            [![Codacy Badge](https://api.codacy.com/project/badge/Grade/1a2997c614cf4da09452f47d70d72352)](https://www.codacy.com/app/l-mieulet/meteor-coverage-app-exemplee) |
| [fork of apollostack/meteor-starter-kit](https://github.com/serut/meteor-starter-kit) |                                                                                                                                                       |                   [![Circle CI](https://circleci.com/gh/serut/meteor-starter-kit.svg?style=svg)](https://circleci.com/gh/serut/meteor-starter-kit) |                                                                                                                                                                                                |                   [![codecov](https://codecov.io/gh/serut/meteor-starter-kit/branch/master/graph/badge.svg)](https://codecov.io/gh/serut/meteor-starter-kit) |                                                                                                                                                                                                                                                                                                              |

[![Dependency Status](https://img.shields.io/david/serut/meteor-coverage.svg)](https://david-dm.org/serut/meteor-coverage)
[![devDependency Status](https://img.shields.io/david/dev/serut/meteor-coverage.svg)](https://david-dm.org/serut/meteor-coverage?type=dev)


<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**

  - [Installation](#installation)
    - [Specific setup for Meteor apps](#specific-setup-for-meteor-apps)
    - [Specific setup for Meteor package](#specific-setup-for-meteor-package)
    - [Configuration](#configuration)
  - [Usage](#usage)
    - [Watch mode](#watch-mode)
    - [Using runners](#using-runners)
    - [Run options](#run-options)
  - [Setup spacejam](#setup-spacejam)
  - [Advanced setup for CI](#advanced-setup-for-ci)
    - [Coveralls](#coveralls)
    - [Codecov](#codecov)
  - [spacejam --coverage possibilities](#spacejam---coverage-possibilities)
  - [Meteor --settings file](#meteor---settings-file)
  - [Global environment variable](#global-environment-variable)
  - [Config file](#config-file)
  - [Flow router issue](#flow-router-issue)
  - [My files are missing from my app coverage report](#my-files-are-missing-from-my-app-coverage-report)
  - [Istanbul html colors legend](#istanbul-html-colors-legend)
  - [Ignore code from coverage with annotation](#ignore-code-from-coverage-with-annotation)
  - [Meteor ignored folders and files](#meteor-ignored-folders-and-files)
  - [How to replace spacejam](#how-to-replace-spacejam)
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

Ensure you use at least Meteor version `v1.6`.

Then, run the following  :

```txt
meteor add lmieulet:meteor-coverage practicalmeteor:mocha@2.4.5_6 practicalmeteor:mocha-console-runner
```

### Specific setup for Meteor package

 In a meteor package, you need to add inside the `package.js` file:  

```js
[...]
Package.onTest(function (api) {
    api.use(['ecmascript', 'practicalmeteor:mocha', 'practicalmeteor:chai', 'practicalmeteor:sinon', 'lmieulet:meteor-coverage@2.0.0']);
[...]
});
```

Then, [create your configuration](#config-file) file `.coverage.json` to specify that you want to cover your package, using the `include` key.

### Configuration

Setup how you want to run your app. Actually, to let meteor-coverage start processing, you need to enable it, because it's a probe disabled by default and you need to provide the absolute path to your source folder.

-   [use spacejam](#setup-spacejam) as a test runner, perfect for CI or prepublish hooks. Spacejam setup everything for you throw the `--coverage` option.  
    OR
-   [use a meteor setting file](#meteor---settings-file) to store the coverage configuration, then run your app in watch mode with `--settings settings.coverage.json`  
    OR
-   set these environment variables : `COVERAGE`, `COVERAGE_VERBOSE` & `COVERAGE_APP_FOLDER`.

meteor-coverage ensures the output folder exist on boot, which is by default `./.coverage` inside your app.  
For Typescript or any simular language users, you need to remap your code.

## Usage

### Watch mode

Run the following command :

    meteor [... see supported options below] \
    --settings settings.coverage.json

Then open [localhost:3000/coverage](http://localhost:3000/coverage) in your browser. A missing feature would be to save your client coverage with a widget. Instead, you need to enter this javascript in your browser console :

    Meteor.sendCoverage(function(stats,err) {console.log(stats,err);});
    # Reopen localhost:3000/coverage to see that client coverage have been saved on server

    # Creates an html export inside coverage_app_folder/output_folder/index.html
    Meteor.exportCoverage("html", function(err) {console.log(err)})

### Using runners

You can use spacejam to execute automatically all the actions that you needs to do in watch mode:  

    spacejam [... see supported options below] \
    --coverage [out_html|out_lcovonly|out_text_summary|out_json_report|out_json_summary|in_coverage|out_coverage|out_remap] \
    --driver-package practicalmeteor:mocha-console-runner

That's it !

### Run options

While spacejam requires mocha, meteor-coverage is agnostic on this point. If the `COVERAGE` flag is true, it instruments your app and provides an HTTP API to generate reports.

These options are supported :

    [run|test|test --full-app|test-packages]

## Setup spacejam

If you have any trouble, refer to this example of Meteor application [meteor-coverage-app-exemple](https://github.com/serut/meteor-coverage-app-exemple) to see how a test runner can execute yours tests, save coverage and send it to coveralls. Or feel free to open an issue. For now `serut/spacejam:windows-suppport-rc4` is only a fork but it will be merged someday.  

Add the following dependencies in your `package.json`:

    meteor npm init # If the package.json file does not exist
    meteor npm i --save-dev https://github.com/serut/spacejam/tarball/windows-suppport-rc4

Add what you need to run your app inside your `package.json`:

    "scripts": {
        [APP]
        "test": "meteor npm run lint:fix & meteor npm run test:app-unit & ...",
        "test:app-unit": "meteor test --driver-package practicalmeteor:mocha-console-runner",
        "test:app-unit-watch": "meteor test --driver-package practicalmeteor:mocha",
        "test:app-full-watch": "meteor test --full-app --driver-package practicalmeteor:mocha",
        "test:packages-watch": "meteor test-packages --driver-package practicalmeteor:mocha",

        "precoverage": "npm run lint",
        "coverage": "meteor npm run coverage:app-unit && meteor npm run coverage:app-full",
        "coverage:app-unit": "spacejam test --coverage 'out_lcovonly out_coverage out_html' --driver-package practicalmeteor:mocha-console-runner",
        "coverage:app-full": "spacejam test --full-app --coverage 'out_lcovonly out_coverage out_html in_coverage' --driver-package practicalmeteor:mocha-console-runner",
        "precoverage-watch": "npm run lint",
        "coverage-watch:app-unit": "meteor test --settings settings.coverage.json --driver-package practicalmeteor:mocha",
        "coverage-watch:app-full": "meteor test --full-app --settings settings.coverage.json --driver-package practicalmeteor:mocha",
        "pretest": "npm run lint",
        "test": "meteor npm run test:app-unit && meteor npm run test:app-full",
        "test:app-unit": "spacejam test --driver-package practicalmeteor:mocha-console-runner",
        "test:app-full": "spacejam test --full-app --driver-package practicalmeteor:mocha-console-runner",
        "pretest-watch": "npm run lint",
        "test-watch:app-unit": "meteor test --driver-package practicalmeteor:mocha-console-runner",
        "test-watch:app-full": "meteor test --full-app  --driver-package practicalmeteor:mocha-console-runner",

        [PCKGS]
        "coverage:packages": "spacejam test-packages ./ --coverage out_lcovonly --driver-package practicalmeteor:mocha-console-runner",
        "coverage-watch": "meteor npm run lint:fix & meteor npm run coverage-watch:packages",
        "coverage-watch:packages": "meteor test-packages --settings settings.coverage.json  --driver-package practicalmeteor:mocha-console-runner",
        "test": "meteor npm run test:packages",
        "test:packages": "meteor test-packages ./ --coverage out_lcovonly --driver-package practicalmeteor:mocha-console-runner",

        "lint": "eslint . || exit 0;",
        "lint:fix": "eslint --fix ."
    }

If you want to, you can use this syntax, the following two commands are equivalent, but the second one is shorter and thus less typing error-prone

    spacejam       [..] --driver-package practicalmeteor:mocha-console-runner
    spacejam-mocha [..]

Same for meteor:

    meteor       --driver-package practicalmeteor:mocha [...]
    meteor-mocha

You may notice that you can't execute `spacejam-mocha` on your terminal, that's because you installed it with the flag `--save-dev`.  
The executable is in fact located in the folder `./node_modules/.bin/` and that's not mentioned inside the `package.json` because the `.bin` folder [is added to the PATH before node runs smth](https://docs.npmjs.com/misc/scripts#path)  

## Advanced setup for CI

Now, you can run your test (here is an extract of a [circle.yml](https://github.com/serut/meteor-coverage-app-exemple/blob/master/circle.yml)), merge coverage between tests, export the coverage report and sent it to a coverage platform:

    - meteor npm install
    # Unit test using mocha
    - meteor npm run coverage:app-unit
    # Integration test using mocha
    - meteor npm run coverage:app-full
    # Package test using mocha
    - meteor npm run coverage:packages

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

## spacejam --coverage possibilities

-   `out_coverage` creates a dump of the coverage - used when you want to merge several coverage
-   `in_coverage` imports a coverage dump (previously create with `out_coverage`)
-   `out_lcovonly` creates a lcov report
-   `out_html` creates a html report
-   `out_json_report` creates a json report
-   `out_json_summary` creates a json_summary report
-   `out_text_summary` creates a text_summary report
-   `out_remap` remaps the coverage to all the available report formats
-   `out_teamcity` & `out_clover` are not working yet

## Meteor --settings file

Create the `settings.coverage.json` file with the following:

```json
{
    "coverage": {
        "On windows"
        "coverage_app_folder": "C:\\Users\\you\\dev\\meteor-app\\",
        "On unix"
        "coverage_app_folder": "/Users/you/meteor-app/",
        "is_coverage_active": true,
        "verbose": false
    }
}
```

Note that `coverage_app_folder : /path/to/your/meteor/app/` requires to end with a trailing slash.

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
  "--": "Meteor app does not require any specific configuration",
  "--": "If you want to instrument a package, you need to add the following",
  "include": [
    "**/packages/author_packageName.js"
  ],
  "--": "If you want to, you can redefine the following:",
  "exclude": {
    "general": [],
    "server": [
      "**/node_modules/**/*.json",
      "**/.?*/**",
      "**/packages/!(local-test_?*.js)",
      "**/+([^:]):+([^:])/**",
      "**/@(test|tests|spec|specs)/**",
      "**/?(*.)test?(s).?*",
      "**/?(*.)spec?(s).?*",
      "**/?(*.)app-test?(s).?*",
      "**/?(*.)app-spec?(s).?*"
    ],
    "client": [
      "**/client/stylesheets/**",
      "**/.npm/package/node_modules/**",
      "**/web.browser/packages/**",
      "**/.?*/**",
      "**/packages/!(local-test_?*.js)",
      "**/+([^:]):+([^:])/**",
      "**/@(test|tests|spec|specs)/**",
      "**/?(*.)test?(s).?*",
      "**/?(*.)spec?(s).?*",
      "**/?(*.)app-test?(s).?*",
      "**/?(*.)app-spec?(s).?*"
    ]
  },
  "remapFormat": ["html", "cobertura", "clover", "json", "json-summary", "lcovonly", "teamcity", "text", "text-summary"],
  "output": "./.coverage"
}
```

Details :

-   Allows / Disallow is coded with the following order `include`, `exclude.general`, `exclude.(client|server)`, it is used before both instrumentation and before coverage report creation.
-   The glob syntax can be found [here](http://www.linuxjournal.com/content/bash-extended-globbing).
-   To create your custom config file, run the project with `COVERAGE_VERBOSE=1` env variable and use logs to see which filenames were hooked or hidden. PR welcome.
-   The output folder needs to starts with a dot to exclude that folder from Meteor build.

## Flow router issue

If you are using flow-router, there are [an issue](https://github.com/kadirahq/flow-router/pull/615) that prevents tests to succeed.  
This workaround replaces flow-router with a patched version which ignores that error:

```bash
cd packages
git submodule add https://github.com/serut/flow-router
```

## My files are missing from my app coverage report

If you have **internal packages** inside your app and you want to get their **server side** coverage. Open the file `.meteor/packages` and move the line `lmieulet:meteor-coverage` to be above these packages.

## Istanbul html colors legend

-   Pink: statement not covered
-   Orange: function not covered
-   Yellow: branch not covered
-   [I] and [E] in front of if-else statements: if or else not covered respectively
-   Branch coverage display only kicks in if one or more but not all branches have been taken (if none of the branches were taken the statement coverage will show you that unambiguously)

## Ignore code from coverage with annotation

For example, if you code an `if` block without `else`, istanbul marks the `else` branch as not covered (although it doesn't exist), decreasing your code coverage, which is **false**.

Same issue with ternary operator (`expression ? value1 : value2`) or default assignments (like `let myVar = otherVar || {}`), which always get marked as uncovered branches.

The syntax can be found at [istanbul docs - ignoring code](https://github.com/gotwarlost/istanbul/blob/master/ignoring-code-for-coverage.md).

## Meteor ignored folders and files

-   hidden folders like .npm, .coverage or .meteor.
-   special folders like node_modules.
-   all meteor packages (bundled and/or manually installed ones) like meteor/underscore, meteor/accounts-password or aldeed:simple-schema.
-   all tests file(s) containing `spec?|test?|specs?|tests?|app-specs?|app-tests?`  and all folder(s) named `specs?|tests?|app-specs?|app-tests?`

## How to replace spacejam

You can find [here](https://github.com/practicalmeteor/spacejam/compare/windows-suppport...serut:windows-suppport-rc4?diff=split&name=windows-suppport-rc4#diff-f388d8f4ed9765929079f40166396fdeR65) the diff between "spacejam without coverage" and "spacejam coverage", so you can build something else,  with grunt for example, that exports your test.

## I want my reports referred to my original source files

If you are using a language that compiles to JavaScript (there are [lots of them](https://github.com/jashkenas/coffeescript/wiki/list-of-languages-that-compile-to-js)), you may want to see your coverage reports referred to the original source files (prior to compilation).

To remap your source files, you have to provide the report type `out_remap` explicitly when using `spacejam`: `spacejam-mocha --coverage out_remap`

You'll get your remapped coverage reports at `./.coverage/.remap` (or `custom_output/.remap` if you're customized the output folder through the file `.coverage.json`).

The coverage is remapped to **all the available reports** (listed in the following example) by default. If you only want some of them, you need to request them explicitly through the key `remap.format` in `.coverage.json` like this:

```json
{
  "include": [
    "**/packages/lmieulet_meteor-coverage.js"
  ],
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
Meteor.sendCoverage(function(stats,err) {console.log(stats,err);});
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
