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
