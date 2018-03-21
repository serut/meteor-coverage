import { HTTP } from 'meteor/http';

describe('meteor-coverage', function (done) {

  it('download a lot of times the same a client js script, ensure they are not corrumpted', function (done) {
    this.timeout(0);

    let i = 0;
    const downloadPageAndCheckLength = function (i) {
      // meteor-coverage package is a ES6 package
      HTTP.get('/packages/lmieulet_meteor-coverage.js', {}, (error, response) => {
        if (response.content.length > 14000) {
          if (i < 5000) {
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
