describe('meteor-coverage', function (done) {

  it('download a lot of times the same a client js script, ensure they are not corrumpted', function (done) {
    this.timeout(0);

    let i = 0;
    const downloadPageAndCheckLength = function (i) {
      // meteor-coverage package is a ES6 package
      let request = $.ajax({
        type: 'GET',
        url: '/packages/lmieulet_meteor-coverage.js',
        success: function () {
          if (request.getResponseHeader('Content-Length') > 5000000) {
            if (i < 5000) {
              return downloadPageAndCheckLength(i+1);
            }
            return done();
          }
          return done(request.getResponseHeader('Content-Length'), 'Request returned as corrumpted');
        }
      });
    };
    downloadPageAndCheckLength(i);
  });
});
