const sinon = require('sinon');
const chai = require('chai');
const expect = require('chai').expect;
const proxyquire = require('proxyquire');
const newsFixture = require('./fixtures/newsResponse.json');

const sandbox = sinon.sandbox.create();

const capiStub = {
	getArticle: sandbox.stub(),

};
const subject = proxyquire('../lib/article', {'../lib/fetchContent': capiStub});


describe('article', () => {

	afterEach(() => {
		sandbox.reset();
	});

	const id = '70fc3c0e-1cb5-11e8-956a-43db76e69936';

	context('content requested is a news article', () => {

		beforeEach(() => {
			capiStub.getArticle.returns(Promise.resolve(newsFixture));
		});

	it('gets the title from the capi response', () => {
		return subject.extractData(id)
		.then(res => {
			expect(res.essencePhrases[0]).to.include({
				"type": "Title",
	      "text": "PSA chief demands fairness on emissions penalties"
			});
		});
	});

	it('gets the standfirst from the capi response', () => {
		return subject.extractData(id)
		.then(res => {
			expect(res.essencePhrases[1]).to.include({
				"type": 'Standfirst',
    		"text": 'Carlos Tavares says countries must install enough electric-car charging points'
			});
		});
	});

	it('gets each predicate and type from the annotations', () => {
		return subject.extractData(id)
		.then(res => {
			expect(res.context[1]).to.include({
				"type": 'annotation:about:ORGANISATION', text: 'PSA Group'
			})
		});
	});
});

});
