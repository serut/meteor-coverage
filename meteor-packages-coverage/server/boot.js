import Router from './router';
import Instrumenter from './services/instrumenter';
import SourceMap from './services/source-map';

export default Boot = {
  startup() {
    // Search for PUTs and check whether called from inside/outside a PUT dir
    SourceMap.initialSetup();
    // Start to collect coverage
    Instrumenter.hookLoader();
    // Connect the router to this app
    new Router();
  }
};
