const express = require('express');
const router = express.Router();
const fetchContent = require('../lib/fetchContent');
const debug = require('debug')('routes:article');
const extractText = require('../utils/extract-text');

router.get('/:uuid', (req, res) => {
  return fetchContent.getArticle(req.params.uuid)
  .then(content => {
    const phrases = [];
    phrases.push({'type': 'Title: ', text: content.title}, {'type': 'Standfirst: ', text: content.standfirst});

    const type = content.annotations.find(object => {
      return object.type === 'GENRE'
    });
    const text = extractText(content.bodyXML);

    if (type.prefLabel === 'News') {
      const first = text.match(/(^.*?[a-z]{2,}[.!?])\s+\W*[A-Z]/)[1];
      phrases.push({'type': 'First sentence: ', text: first});
    }

    return res.render('index', { content: content, template: 'article', phrases: phrases, text: text })
  })
  .catch(err => {
    res.status(400).send( debug(err) ).end();
  });
});

module.exports = router;
