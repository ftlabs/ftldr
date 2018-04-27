const chai = require('chai');
const expect = require('chai').expect;
const nock = require('nock');
const newsFixture = require('./fixtures/newsResponse.json');
const subject = require('../lib/fetchContent.js');

describe('getArticle', () => {

  const newsId = '70fc3c0e-1cb5-11e8-956a-43db76e69936';

  afterEach(() => {
  nock.cleanAll();
  });

  context('for a 200 repsonse', () => {

    beforeEach(() => {
      nock('https://api.ft.com')
      .get(`/enrichedcontent/${newsId}?apiKey=${process.env.CAPI_KEY}`)
        .reply(200, newsFixture);
    });

    it('returns an object', () => {
      return subject.getArticle(newsId)
      .then(res => {
        expect(nock.isDone()).to.be.true;
        expect(res.title).to.equal('PSA chief demands fairness on emissions penalties');
      })
    });
  });

  context('for a 400 response', () => {

    beforeEach(() => {
      nock('https://api.ft.com')
      .get(`/enrichedcontent/${newsId}?apiKey=${process.env.CAPI_KEY}`)
        .reply(400, 'Forbidden');
    });

    it('throws an error', () => {
      return subject.getArticle(newsId)
      .then(res => {
        //a signal that the expected exception was not thrown
        expect.fail(null, `ERROR: fetch article for uuid=${newsId} status code=400`, 'This should not have resolved')
      })
      .catch((err) => {
        expect(err).to.equal(`ERROR: fetch article for uuid=${newsId} status code=400`);
      })
    });
  });
});
