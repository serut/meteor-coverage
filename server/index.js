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
  // Provide the real library
  library = Lib.default;
} else {
  // Mock the library
  library = {
    Conf,
    Router: {

    },
    SourceMap: {
      registerSourceMap: function () {
        throw 'COVERAGE_NOT_ACTIVE';
      }
    },
    CoverageData: {

    },
    Instrumenter: {
      hookLoader: function() {}
    },
    ReportService: {

    }
  };
}

export default library;