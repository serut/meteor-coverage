if (IS_COVERAGE_ACTIVE) {
    var fs = Npm.require('fs'),
        path = Npm.require('path');


    showCoverage = function (params, req, res, next) {
        var url = params.query.p;
        Core.render(url, res, '/coverage/');
    }

    // @Todo: use async functions
    getAsset = function(params, req, res, next) {
        var assetsDir = path.join(path.resolve('.'), "assets/packages/lmieulet_meteor-coverage/assets/"),
            filename = params.filename;
        Log.info(assetsDir)
        if (fs.existsSync(path.join(assetsDir, filename))) {
            var fileContent = fs.readFileSync(assetsDir + '/' + filename);
            res.end(fileContent);
        } else {
            if (fs.existsSync(path.join(assetsDir, '/vendor/', filename))) {
                var fileContent = fs.readFileSync(assetsDir + '/vendor/' + filename);
                res.end(fileContent);
            } else {
                next();
            }
        }
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
            if (fs.existsSync(path + fileurl)) {
                var fileContent = fs.readFileSync(path + fileurl, 'utf8');
                res.setHeader('Content-type', 'application/javascript')
                res.end(Instrumenter.instrumentClientScriptSync(fileContent, pathLabel));
            } else {
                next();
            }
        } else {
            next();
        }
    }

    Handlers = {
        showCoverage: showCoverage,
        getAsset: getAsset,
        addClientCoverage: addClientCoverage,
        instrumentClientJs: instrumentClientJs
    }

}
