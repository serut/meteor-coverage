import CoverageData from './services/coverage-data';
import Conf from './context/conf';
import Router from './router';
import ReportService from './report/report-service';
import Boot from './boot.js';


Boot.startup();

export default {
  Conf,
  Router,
  CoverageData,
  ReportService
};
