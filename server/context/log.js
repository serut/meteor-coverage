export default Log = {
  COVERAGE_VERBOSE: process.env['COVERAGE_VERBOSE'] === '1' || false,
  error: function() {
    if (this.COVERAGE_VERBOSE) {
      console.error(...arguments);
    }
  },
  info: function() {
    if (this.COVERAGE_VERBOSE) {
      console.log(...arguments);
    }
  },
  time: function() {
    if (this.COVERAGE_VERBOSE) {
      console.log(...arguments);
    }
  },
  timeEnd: function() {
    if (this.COVERAGE_VERBOSE) {
      console.log(...arguments);
    }
  }
};
