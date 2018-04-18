const express = require('express');
const router = express.Router();
const fetchContent = require('../lib/fetchContent');

router.get('/', (req, res) => {
  res.render('article');
});

module.exports = router;
