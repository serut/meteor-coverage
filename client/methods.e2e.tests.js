import Meteor from 'meteor/lmieulet:meteor-coverage';
import {chai, assert, expect} from 'chai';
var _should = chai.should();

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

  // test implemented report types
  let coverage = {
    export: ['coverage', 'html', 'json', 'json-summary', 'lcovonly', 'remap', 'text-summary'],
    import: ['coverage']
  };
  for (let operation in coverage) {
    if (coverage.hasOwnProperty(operation)) {
      coverage[operation].forEach(function (reportType) {
        it(`${operation} [${reportType}]`, function (done) {
          testCoverage.call(this, done, operation, reportType); // pass mocha context
        });
      });
    }
  }

  // test non-implemented report types
  let reportTypes = {
    disallowed: ['', 'none', 'random-invented'],
    pending: ['clover', 'cobertura', 'lcov', 'text', 'text-lcov']
  };
  for (let group in reportTypes) {
    if (reportTypes.hasOwnProperty(group)) {
      reportTypes[group].forEach(function (reportType) {
        it(`export [${reportType}] should fail`, function (done) {
          this.timeout(0);
          try {
            Meteor.exportCoverage(reportType, function (err) {
              if (group === 'disallowed') {
                expect(err).to.be.undefined;
              } else {
                err.should.be.a('string');
                assert.isTrue(err.startsWith('Error: '));
              }
              done();
            });
          } catch (e) {
            console.error(e, e.stack);
            done(e);
          }
        });
      });
    }
  }
});
