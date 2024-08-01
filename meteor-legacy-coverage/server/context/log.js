const meteor_parameters = {
  // /:\ ES 6
  // return the value OR UNDEFINED
  // THIS IS NOT A BOOLEAN
  VERBOSE: Meteor && Meteor.settings && Meteor.settings.coverage && Meteor.settings.coverage.verbose
};

const Log = {
  COVERAGE_VERBOSE: meteor_parameters.VERBOSE || process.env['COVERAGE_VERBOSE'] === '1' || false,
  error: function() {
    console.error(...arguments);
  },
  info: function() {
    /* istanbul ignore else */
    if (this.COVERAGE_VERBOSE) {
      console.log(...arguments);
    }
  },
  time: function() {
    /* istanbul ignore else */
    if (this.COVERAGE_VERBOSE) {
      console.log(...arguments);
    }
  },
  timeEnd: function() {
    /* istanbul ignore else */
    if (this.COVERAGE_VERBOSE) {
      console.log(...arguments);
    }
  }
};

export default Log;
