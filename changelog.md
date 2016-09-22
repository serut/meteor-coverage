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
