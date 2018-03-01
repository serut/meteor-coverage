import { HTTP } from 'meteor/http';
import { expect, assert } from 'meteor/practicalmeteor:chai';
import { sinon } from 'meteor/practicalmeteor:sinon';
import Meteor from 'meteor/lmieulet:meteor-coverage';

describe('meteor-coverage', function (done) {

  let sandbox;
  beforeEach(function() {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function(){
    sandbox.restore();
  });

  it('should be defined', function () {
    assert.isDefined(Meteor.exportCoverage);
    assert.isDefined(Meteor.getCoverageObject);
    assert.isDefined(Meteor.importCoverage);
    assert.isDefined(Meteor.sendCoverage);
  });

  it('calls the callback function if there is no coverage', function () {
    const callback = sandbox.spy();
    sandbox.stub(Meteor, 'getCoverageObject');

    Meteor.sendCoverage(callback);
    expect(callback).to.have.been.deep.calledWith({SUCCESS: 0, FAILED: 0, TOTAL: 0});
  });

  it('send client coverage', function () {
    const callback = sandbox.spy();

    sandbox.stub(Meteor, 'getCoverageObject').returns({ 'web.browser': { path: 1} });
    sandbox.stub(HTTP, 'post', function(url, config, callback) {
      callback();
    });

    Meteor.sendCoverage(callback);
    expect(callback).to.have.been.deep.calledWith({FAILED: 0, SUCCESS: 1, TOTAL: 1});
  });

  it('export coverage', function () {
    const callback = sandbox.spy();

    sandbox.stub(JSON, 'parse').returns({ type: 'success'});
    sandbox.stub(HTTP, 'get', function(url, config, callback) {
      callback();
    });

    Meteor.exportCoverage('test', callback);
    expect(callback).to.have.been.called;
  });

  it('import coverage', function () {
    const callback = sandbox.spy();

    sandbox.stub(JSON, 'parse').returns({ type: 'success'});
    sandbox.stub(HTTP, 'get', function(url, config, callback) {
      callback();
    });

    Meteor.importCoverage(callback);
    expect(callback).to.have.been.called;
  });
});
