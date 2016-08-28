export const COVERAGE_VERBOSE = process.env['COVERAGE_VERBOSE'] === '1' || false;

export default Log = {
  error: function() {
    if (COVERAGE_VERBOSE) {
      console.error(...arguments);
    }
  },
  info: function() {
    if (COVERAGE_VERBOSE) {
      console.log(...arguments);
    }
  },
  time: function() {
    if (COVERAGE_VERBOSE) {
      console.log(...arguments);
    }
  },
  timeEnd: function() {
    if (COVERAGE_VERBOSE) {
      console.log(...arguments);
    }
  }
};