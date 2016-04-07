if (process.env["COVERAGE"] === "1") {
    var fs = Npm.require('fs'),
        path = Npm.require('path');


    showFolderCoverage = function(params, req, res, next) {
        var url = params.query.p;
        Core.render(url, res, '/coverage/');
    }
    showcoverage = function (params, req, res, next) {
        Core.render(null, res, '/coverage/');
    }

    // @Todo: use async functions
    getAsset = function(params, req, res, next) {
        var assetsDir = path.join(path.resolve('.'), "assets/packages/meteor-coverage/assets/"),
            filename = params.filename;
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
                clientCoverage = JSON.parse(property);
            }
        }
        if (clientCoverage) {
            Core.mergeClientCoverage(clientCoverage);
            res.end('Thanks !');
        } else {
            res.writeHead(400);
            res.end();
        }
    }

    instrumentClientJs = function(params, req, res, next) {
        var fileurl = req.url.split('?')[0];
        if (Core.shallInstrumentClientScript(fileurl)) {
            var path,
                pathLabel;
            if (req.url.indexOf('/packages') == 0) {
                path = '../web.browser'
                pathLabel = path + fileurl;
            } else {
                path = '../web.browser/app'
                pathLabel = path + fileurl;
            }
            if (fs.existsSync(path + fileurl)) {
                var fileContent = fs.readFileSync(path + fileurl, 'utf8');
                res.setHeader('Content-type', 'application/javascript')
                res.end(Core.instrumentSync(fileContent, pathLabel));
            } else {
                next();
            }
        } else {
            next();
        }
    }

    Handlers = {
        showFolderCoverage: showFolderCoverage,
        showcoverage: showcoverage,
        getAsset: getAsset,
        addClientCoverage: addClientCoverage,
        instrumentClientJs: instrumentClientJs
    }

}
