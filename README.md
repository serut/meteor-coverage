[![Build Status](https://travis-ci.org/TODO.png?branch=master)](https://travis-ci.org/TODO)

meteor-coverage
=========================

A meteor package that allows you to get the statement, line, function and branch coverage of your meteor project and your meteor package.  
A good point is that it instruments all the client code, but however it does not instruments all the server code.  
That's because meteor does not read this package before reading yours packages. 

This package uses the [istanbul api](https://github.com/istanbuljs/istanbul-api) package for coverage report and [meteorhacks:picker](https://github.com/meteorhacks/picker) for server side routing.  
It's a debug only package, so it does not affect your production build.

## Installation

In your Meteor app directory, enter:

```
$ meteor add lmieulet:meteor-coverage
```
If you want to see more coverage, open the file `.meteor/packages` and move the line `lmieulet:meteor-coverage` to the top of this file.  
It will read the package before others.

## Get report

Open the page:
```
http://localhost:3000/coverage
```
## Config file

You can specify which files will not be covered in reports.
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

## Global environment variable

You need to set up these environment variables: 
* `COVERAGE=1` to enable coverage
* `COVERAGE_FILE=/path/to/custom/coverage/file` to override the default config file.

## Limitation(s) / open issues


* You see the coverage of processed files (by meteor), and not source code.
* Some lines of client and server files will never be executed, so your coverage is not as low as it shows you (1 or 2 lines per file will never be executed)
* No integration with Velocity and tinytest yet. But it's test runners that need to send the client coverage to the server when tests are done. An example of the query that merge the client coverage into the report is available inside `client/client.js`.
* If the client `__coverage__` object is too large, it cannot be sent to the server.
* Developpers cannot declare in a config file which
    * `public js files` are not instrumented
    * `client js files` are not instrumented
    * `package client js files` are not instrumented
    * `server js files` are not instrumented
    * `package server js files` are not instrumented
* Integration with coveralls.io, travis-ci, ... ?
* No global environment variable usage yet


## Contributing

Anyone is welcome to contribute.  
Fork, make and test your changes (`meteor test-packages`),
and then submit a pull request.
