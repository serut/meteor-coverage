import { assert } from 'meteor/practicalmeteor:chai';
import Meteor from 'meteor/lmieulet:meteor-coverage';
describe('meteor-coverage', function (done) {
    it('should be defined', function () {
        assert.isDefined(Package)
        assert.isDefined(Package['meteor'])
        assert.isDefined(Package['meteor']['Meteor'].sendCoverage)
        assert.isDefined(Package['meteor']['Meteor'].exportCoverage)
        assert.isDefined(Package['meteor']['Meteor'].importCoverage)
    });

    it('send client coverage', function (done) {
        try {
            Meteor.sendCoverage(
                function(stats,err) {
                    assert.isTrue(stats.TOTAL > 0, "no client coverage");
                    assert.isTrue(stats.SUCCESS > 0, "none of the client coverage have been saved");
                    assert.isTrue(stats.FAILED === 0, "an export failed");
                    done();
                }
            );
        } catch (e) {
            console.error (e, e.stack)
            done(e);
        }
    });

    it('export coverage', function (done) {
        this.timeout(10000);
        try {
            Meteor.exportCoverage(
                'coverage',
                function(err) {
                    assert.isUndefined(err);
                    done();
                }
            );
        } catch (e) {
            console.error (e, e.stack)
            done(e);
        }
    });

    it('import coverage', function (done) {
        this.timeout(10000);
        try {
            Meteor.importCoverage(
                function(err) {
                    assert.isUndefined(err);
                    done();
                }
            );
        } catch (e) {
            console.error (e, e.stack)
            done(e);
        }
    });

    it('export lcovonly', function (done) {
        this.timeout(10000);
        try {
            Meteor.exportCoverage(
                'lcovonly',
                function(err) {
                    assert.isUndefined(err);
                    done();
                }
            );
        } catch (e) {
            console.error (e, e.stack)
            done(e);
        }
    });

    it('export json', function (done) {
        this.timeout(10000);
        try {
            Meteor.exportCoverage(
                'json',
                function(err) {
                    assert.isUndefined(err);
                    done();
                }
            );
        } catch (e) {
            console.error (e, e.stack)
            done(e);
        }
    });

    it('export json-summary', function (done) {
        this.timeout(10000);
        try {
            Meteor.exportCoverage(
                'json-summary',
                function(err) {
                    assert.isUndefined(err);
                    done();
                }
            );
        } catch (e) {
            console.error (e, e.stack)
            done(e);
        }
    });

    it('export html', function (done) {
        this.timeout(20000);
        try {
            Meteor.exportCoverage(
                'html',
                function(err) {
                    assert.isUndefined(err);
                    done();
                }
            );

        } catch (e) {
            console.error (e, e.stack)
            done(e);
        }
    });
    /*
    // not working
    it('export teamcity', function (done) {
        this.timeout(10000);

        Meteor.exportCoverage(
            'teamcity',
            function(err) {
                assert.isUndefined(err);
                done();
            }
        );
    });*/
});
