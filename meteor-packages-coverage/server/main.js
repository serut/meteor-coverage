import Instrumenter from './services/instrumenter';
import CoverageData from './services/coverage-data';
import SourceMap from './services/source-map';
import Conf from './context/conf';
import Router from './router';
import ReportService from './report/report-service';
import Boot from './boot.js';

Boot.startup();

export default {
  Conf,
  Router,
  SourceMap,
  CoverageData,
  Instrumenter,
  ReportService
};
