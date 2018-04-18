const express = require('express');
const router = express.Router();
const fetchContent = require('../lib/fetchContent');

router.get('/:uuid', (req, res) => {
  fetchContent.getArticle(req.params.uuid)
  .then(content => res.json(content))
  .catch(err => {
    res.status(400).send( debug(err) ).end();
  });
});

module.exports = router;
