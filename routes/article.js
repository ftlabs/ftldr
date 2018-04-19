const express = require('express');
const router = express.Router();
const fetchContent = require('../lib/fetchContent');
const debug = require('debug')('routes:article');

router.get('/:uuid', (req, res) => {
  return fetchContent.getArticle(req.params.uuid)
  .then(content => {
    return res.render('index', { content: content, template: 'article' })
  })
  .catch(err => {
    res.status(400).send( debug(err) ).end();
  });
});

module.exports = router;
