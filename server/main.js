import Instrumenter from './services/instrumenter';
import CoverageData from './services/coverage-data';
import SourceMap from './services/source-map';
import Conf from './context/conf';
import Router from './router';
import ReportService from './report/report-service';

// Start to collect coverage
Instrumenter.hookLoader();
// Connect the router to this app
new Router();

export default {
  Conf,
  Router,
  SourceMap,
  CoverageData,
  Instrumenter,
  ReportService
};
