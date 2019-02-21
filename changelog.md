#### 3.2.0
-   Handle Typescript Meteor projects

#### 3.1.1
-   Fix HTML and HTTP reports type

#### 3.0.0
Move to babel instrumenter for meteor apps. 

Breaking changes:
This package does not make file coverage anymore, you need to add a third plugin to do that.

For meteor apps, use the babel module named istanbul. 
For packages, you need to add lmieulet:meteor-packages-coverage. That's a copy of meteor-coverage some commits ago. So it handles the instrumentation like before. 

#### 2.0.2
Fix Meteor.sendCoverage function, otherwise test runner thinks they failed to import client coverage.  

#### 2.0.1
Republishing...

#### 2.0.0
-   Migrates to Meteor 1.6.
    For Meteor 1.4 apps please use meteor-coverage@1.1.4.
-   remove some outdated libraries in favor to new ones:
      - meteorhacks:picker -> webapp (directly from meteor)
      - Jquery -> http (directly from meteor)
      - istanbul-api -> istanbuljs/istanbuljs

#### 1.1.4

#### 1.0.1
-   map a lot better the paths inside `.map` files to real paths. You can now see .npm dependencies for exemple.
-   improved glob patterns in `.coverage.json`: previously, all files were covered. Now **a lot less** are covered. To be able to cover packages, you need to specify it on the `.coverage.json`  
-   add warning when `.coverage.json` is an invalid JSON
-   environment variables are now deprecated in favor of meteor `--settings`
-   on boot, meteor-coverage creates the report folder
-   fix verbosity ignored on report generation
-   add new type of export: `remap`. It adds support to languages that compile to JavaScript, like TypeScript

#### 0.9.4

-   The configuration file `.coverage.json` is now written in minimatch syntax instead of regex
    Thanks to @thiagodelgado111 for his pull request #13
-   add new type of export: `text-summary`
-   add Meteor.settings support (can replace environment variable)
-   lint, tests, and more es6

#### 0.9.1

-   fix a bug that prevents an app to boot when meteor-coverage is present but not covering (COVERAGE=0)

#### 0.9.0

-   move code structure to es6
-   remove tinytest and use mocha instead
-   add a new option in the `coverage.json` file to set up the output folder, default is `./.coverage`
-   add new type of export: `html`, `json`, `json_summary`
-   spacejam received an update

[Meteor forum thread](https://forums.meteor.com/t/coverage-on-meteor/20035)
