import Handlers from './handlers';
import Conf from './context/conf';
import bodyParser from 'body-parser';
import url from 'url';

const handleRequest = (method) => (path, cb) => {
  WebApp.rawConnectHandlers.use(path, (req, res, next) => {
    if (req.method !== method) {
      next();
      return;
    }

    const queryString = url.parse(req.url).query || '';
    const queryParams = { query: {} };
    queryString.split('&').forEach((pair) => {
      queryParams.query[pair.split('=')[0]] = pair.split('=')[1];
    });

    Promise.resolve()
    .then(() => new Promise(resolve => {
      bodyParser.urlencoded({ extended: false })(req, res, resolve);
    }))
    .then(() => new Promise(resolve => {
      bodyParser.json({ limit: '30mb' }).call(null, req, res, resolve);
    }))
    .then(() => cb(queryParams, req, res, next))
    .catch((e) => {
      console.log('Exception undandled:');
      console.log(e.stack);

      next();
    });
  });
};

export default class {
  constructor() {
    if (Conf.IS_COVERAGE_ACTIVE) {
      this.bindRoutes();
    }
  }

  bindRoutes() {
    // Show static assets
    handleRequest('GET')('/coverage/asset', (params, req, res, next) => {
      params.filename = url.parse(req.url).path.match(/(\/([^\/]+))?/)[2];
      Handlers.getAsset(params, req, res, next);
    });

    // export coverage to file
    handleRequest('GET')('/coverage/export', (params, req, res, next) => {
      params.type = url.parse(req.url).path.match(/(\/([^\/]+))?/)[2];
      Handlers.exportFile(params, req, res, next);
    });

    handleRequest('GET')('/coverage/import', Handlers.importCoverage);

    // merge client coverage posted from browser
    handleRequest('POST')('/coverage/client', Handlers.addClientCoverage);

    handleRequest('GET')('/coverage', Handlers.showCoverage);
  }
}
