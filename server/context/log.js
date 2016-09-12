const meteor_parameters = {
  // /:\ ES 6
  // return the value OR UNDEFINED
  // THIS IS NOT A BOOLEAN
  VERBOSE: Meteor && Meteor.settings && Meteor.settings.coverage && Meteor.settings.coverage.verbose,
};
export const COVERAGE_VERBOSE = meteor_parameters.VERBOSE || process.env['COVERAGE_VERBOSE'] === '1' || false;

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
