if (process.env["COVERAGE"] === "1") {
    var bodyParser = Npm.require('body-parser');

    Picker.middleware(bodyParser.urlencoded({extended: false}));
    Picker.middleware(bodyParser.json());

    var getRoute = Picker.filter(function (req, res) {
            return req.method === 'GET';
        }),
        postRoute = Picker.filter(function (req, res) {
            return req.method === 'POST';
        });

    getRoute.route('/coverage', Handlers.showcoverage);

    getRoute.route('/coverage/show', Handlers.showFolderCoverage);

    // Show static assets
    getRoute.route('/coverage/asset/:filename', Handlers.getAsset);

    getRoute.route('/:arg1?/:arg2?/:arg3?/:arg4?', Handlers.instrumentClientJs);

    //merge client coverage posted from browser
    postRoute.route('/coverage/client', Handlers.addClientCoverage);
}