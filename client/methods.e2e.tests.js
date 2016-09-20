import {assert} from 'meteor/practicalmeteor:chai';
import Meteor from 'meteor/lmieulet:meteor-coverage';

var testCoverage = function(done, operation, reportType) {
  this.timeout(0);
  try {
    let params = operation === 'export' ? [reportType] : [];
    params.push(function (err) {
      assert.isUndefined(err);
      done();
    });
    Meteor[`${operation}Coverage`].apply(this, params);
  } catch (e) {
    console.error(e, e.stack);
    done(e);
  }
};

describe('meteor-coverage', function () {

  it('send client coverage', function (done) {
    this.timeout(10000);
    try {
      Meteor.sendCoverage(
        function (stats, err) {
          assert.isTrue(stats.TOTAL > 0, 'no client coverage');
          assert.isTrue(stats.SUCCESS > 0, 'none of the client coverage have been saved');
          assert.isTrue(stats.FAILED === 0, 'an export failed');
          done();
        }
      );
    } catch (e) {
      console.error(e, e.stack);
      done(e);
    }
  });

  let coverage = {
    export: ['coverage', 'lcovonly', 'json', 'json-summary', 'text-summary', 'html', 'remap'],
    import: ['coverage']
  };
  for (let operation in coverage) {
    if (coverage.hasOwnProperty(operation)) {
      coverage[operation].forEach(function (reportType) {
        it(`${operation} ${reportType}`, function (done) {
          testCoverage.call(this, done, operation, reportType); // pass mocha context
        });
      });
    }
  }
});
