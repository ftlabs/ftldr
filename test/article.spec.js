const sinon = require('sinon');
const chai = require('chai');
const expect = require('chai').expect;
const proxyquire = require('proxyquire');
const fixture = require('./fixtures/capiResponse.json');

const sandbox = sinon.sandbox.create();

const capiStub = {
	getArticle: sandbox.stub(),

};
const subject = proxyquire('../lib/article', {'../lib/fetchContent': capiStub});


describe('article', () => {

	beforeEach(() => {
		capiStub.getArticle.returns(Promise.resolve(fixture));
	});

	afterEach(() => {
		sandbox.reset();
	});

	const id = '70fc3c0e-1cb5-11e8-956a-43db76e69936';

	it('gets the title from the capi response', () => {
		return subject.extractData(id)
		.then(res => {
			expect(res.essencePhrases[0]).to.include({
				"type": "Title",
	      "text": "PSA chief demands fairness on emissions penalties"
			})
		});
	});

	it('gets the standfirst from the capi response', () => {
		return subject.extractData(id)
		.then(res => {
			expect(res.essencePhrases[1]).to.include({
				"type": 'Standfirst',
    		"text": 'Carlos Tavares says countries must install enough electric-car charging points'
			})
		});
	});

});
