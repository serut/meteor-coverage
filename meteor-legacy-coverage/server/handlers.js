import Instrumenter from './services/instrumenter';
import fs from 'fs';

instrumentClientJs = function (params, req, res, next) {
  var fileurl = req.url.split('?')[0];
  if (Instrumenter.shallInstrumentClientScript(fileurl)) {
    var path,
      pathLabel;
    // Either a package
    if (req.url.indexOf('/packages') === 0) {
      path = '../web.browser';
      pathLabel = path + fileurl;
    } else if (req.url.indexOf('/app') === 0) {
      // Or the app/app.js
      path = '../web.browser';
      pathLabel = path + fileurl;
    } else {
      // Or a public file
      path = '../web.browser/app';
      pathLabel = path + fileurl;
    }
    res.setHeader('Content-type', 'application/javascript');
    fs.exists(path + fileurl, function (exists) {
      /* istanbul ignore else */
      if (!exists) return next();
      fs.readFile(path + fileurl, 'utf8', function (err, fileContent) {
        /* istanbul ignore else */
        if (err) return next();
        Instrumenter.instrumentJs(fileContent, pathLabel, function (err, data) {
          /* istanbul ignore else */
          if (err) throw err;
          res.end(data);
        });
      });
    });
  } else {
    next();
  }
};

export default Handlers = {
  instrumentClientJs
};
