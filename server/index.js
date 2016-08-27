import Conf from './context/conf';
let library;

// If the coverage is active, it will import the probe inside this package
// Every script imported using vm.runInThisContext will be hooked by istanbul
// to provide on the fly the instrumented version of each script - in order to generate coverage stats
// You need an external actor like spacejam to run different types of actions automaticaly :
//   - merge several types of coverage
//   - export reports
if (Conf.IS_COVERAGE_ACTIVE) {
  const Lib = require('./main');
  library = Lib;
} else {
  library = {
    Conf,
    Router: {

    },
    SourceMap: {

    },
    CoverageData: {

    },
    Instrumenter: {

    },
    ReportService: {

    }
  };
}

export default library;