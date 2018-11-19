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
    // inject istanbul-instruments into js files loaded by the client
    handleRequest('GET')('/', Handlers.instrumentClientJs);
  }
}
