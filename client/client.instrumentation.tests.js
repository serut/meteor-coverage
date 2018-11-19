import { HTTP } from 'meteor/http';

describe('meteor-coverage', function (done) {

  it('download a lot of times a covered js file, ensure it"s not corrumpted', function (done) {
    this.timeout(0);

    let i = 0;
    const downloadPageAndCheckLength = function (i) {
      // meteor-coverage package is a ES6 package
      HTTP.get('/packages/lmieulet_meteor-coverage.js', {}, (error, response) => {
        if (response.content.length > 5400) {
          if (i < 10) {
            return downloadPageAndCheckLength(i+1);
          }
          return done();
        }
        return done(response.content.length, 'Request returned as corrumpted');
      });
    };
    downloadPageAndCheckLength(i);
  });
});
