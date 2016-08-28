import {$} from 'meteor/jquery';
import {expect, assert} from 'meteor/practicalmeteor:chai';
import {sinon} from 'meteor/practicalmeteor:sinon';
import Meteor from 'meteor/lmieulet:meteor-coverage';

describe('meteor-coverage', function (done) {

  let sandbox;
  beforeEach(function () {
    sandbox = sinon.sandbox.create();
  });

  afterEach(function () {
    sandbox.restore();
  });

  it('should be defined', function () {
    assert.isDefined(Meteor.exportCoverage);
    assert.isDefined(Meteor.getCoverageObject);
    assert.isDefined(Meteor.importCoverage);
    assert.isDefined(Meteor.sendCoverage);
  });

  it('calls the callback function if there are no coverage', function () {
    const callback = sandbox.spy();
    sandbox.stub(Meteor, 'getCoverageObject');

    Meteor.sendCoverage(callback);
    expect(callback).to.have.been.deep.calledWith({SUCCESS: 0, FAILED: 0, TOTAL: 0});
  });

  it('send client coverage', function () {
    const callback = sandbox.spy();

    sandbox.stub(Meteor, 'getCoverageObject').returns({'web.browser': {path: 1}});
    sandbox.stub($, 'ajax', function (config) {
      config.success();
    });

    Meteor.sendCoverage(callback);
    expect(callback).to.have.been.deep.calledWith({FAILED: 0, SUCCESS: 1, TOTAL: 1});
  });

  it('export coverage', function () {
    const callback = sandbox.spy();

    sandbox.stub(JSON, 'parse').returns({type: 'success'});
    sandbox.stub($, 'ajax', function (config) {
      config.success();
    });

    Meteor.exportCoverage('test', callback);
    expect(callback).to.have.been.called;
  });

  it('import coverage', function () {
    const callback = sandbox.spy();

    sandbox.stub(JSON, 'parse').returns({type: 'success'});
    sandbox.stub($, 'ajax', function (config) {
      config.success();
    });

    Meteor.importCoverage(callback);
    expect(callback).to.have.been.called;
  });
});
