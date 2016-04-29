if (IS_COVERAGE_ACTIVE) {
    var fs = Npm.require('fs'),
        path = Npm.require('path');


    showCoverage = function (params, req, res, next) {
        var url = params.query.p;
        Core.render(url, res, '/coverage/');
    }

    getAsset = function(params, req, res, next) {
        var assetsDir = path.join(path.resolve('.'), "assets/packages/lmieulet_meteor-coverage/assets/"),
            filename = params.filename;
        fs.exists(path.join(assetsDir, filename), function(exists) {
            if (!exists) {
              fs.exists(path.join(assetsDir, '/vendor/', filename), function(exists) {
                  if (!exists) return next();
                  fs.readFile(assetsDir + '/vendor/' + filename, function (err, fileContent) {
                      if (err) throw err;
                      res.end(fileContent);
                  });
              });
            } else {
              fs.readFile(assetsDir + '/' + filename, function (err, fileContent) {
                  if (err) throw err;
                  res.end(fileContent);
              });
            }
        });
    }

    addClientCoverage = function (params, req, res, next) {
        var body = req.body;
        if (! body) {
            res.writeHead(400);
            res.end();
        }
        var clientCoverage
        for (var property in body) {
            if (body.hasOwnProperty(property)) {
                clientCoverage = body[property];
            }
        }
        if (clientCoverage) {
            Core.mergeClientCoverage(clientCoverage);
            res.end('Thanks !');
        } else {
            res.writeHead(400);
            res.end("Nothing has been imported");
        }
    }


    exportFile = function (params, req, res, next) {
        var _type = params.type,
            allowedTypes = ['cobertura', 'html', 'json', 'json-summary', 'lcov', 'none', 'teamcity', 'text', 'text-lcov', 'text-summary', 'lcovonly', 'coverage'];
            type = (_.contains(_type, allowedTypes)) ? _type : 'coverage';

        try {
            Core.exportFile(res, type);
        } catch (e) {
            Log.error("Failed to export", e, e.stack)
            res.writeHead(400);
            res.end("Nothing has been export");
        }
    }
    importCoverage = function (params, req, res, next) {
        try {
            Core.importCoverage(res);
        } catch (e) {
            Log.error("Failed to import", e, e.stack)
            res.writeHead(400);
            res.end("No file has been import");
        }
    }

    instrumentClientJs = function(params, req, res, next) {
        var fileurl = req.url.split('?')[0];
        if (Instrumenter.shallInstrumentClientScript(fileurl)) {
            var path,
                pathLabel;
            // Either a package
            if (req.url.indexOf('/packages') == 0) {
                path = '../web.browser'
                pathLabel = path + fileurl;
            } else if (req.url.indexOf('/app') == 0){
                // Or the app/app.js
                path = '../web.browser'
                pathLabel = path + fileurl;
            } else {
                // Or a public file
                path = '../web.browser/app'
                pathLabel = path + fileurl;
            }
            res.setHeader('Content-type', 'application/javascript')
            fs.exists(path + fileurl, function(exists) {
                if (!exists) return next();
                fs.readFile(path + fileurl, 'utf8', function (err, fileContent) {
                    if (err) return next();
                    Instrumenter.instrumentJs(fileContent, pathLabel, function(err, data) {
                        if (err) throw err;
                        res.end(data);
                    })
                })
            })
        } else {
            next();
        }
    }

    Handlers = {
        showCoverage: showCoverage,
        getAsset: getAsset,
        addClientCoverage: addClientCoverage,
        instrumentClientJs: instrumentClientJs,
        exportFile: exportFile,
        importCoverage: importCoverage
    }

}
