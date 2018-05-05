import { HTTP } from 'meteor/http';
import chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import Meteor from 'meteor/lmieulet:meteor-coverage';
const {expect, assert} = chai;
chai.use(sinonChai);

describe('meteor-coverage', function (done) {

  let sandbox;
  beforeEach(function () {
    sandbox = sinon.createSandbox();
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
    expect(callback).to.have.been.calledWith({SUCCESS: 0, FAILED: 0, TOTAL: 0});
  });

  it('send client coverage', function () {
    const callback = sandbox.spy();

    sandbox.stub(Meteor, 'getCoverageObject').returns({'web.browser': {path: 1}});
    sandbox.stub(HTTP, 'call').callsFake(function(verb, url, config, c) {
      c();
    });
    Meteor.sendCoverage(callback);
    expect(callback).to.have.been.calledWith({FAILED: 0, SUCCESS: 1, TOTAL: 1});
  });

  it('export coverage', function () {
    const callback = sandbox.spy();

    sandbox.stub(JSON, 'parse').returns({type: 'success'});
    sandbox.stub(HTTP, 'call').callsFake(function(verb, url, config, c) {
      c();
    });

    Meteor.exportCoverage('test', callback);
    expect(callback).to.have.been.called;
  });

  it('import coverage', function () {
    const callback = sandbox.spy();

    sandbox.stub(JSON, 'parse').returns({type: 'success'});
    sandbox.stub(HTTP, 'call').callsFake(function(verb, url, config, c) {
      c();
    });

    Meteor.importCoverage(callback);
    expect(callback).to.have.been.called;
  });
});
