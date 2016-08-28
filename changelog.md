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
