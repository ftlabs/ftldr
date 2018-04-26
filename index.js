const dotenv = require('dotenv').config({ silent: process.env.NODE_ENVIRONMENT === 'production' });
const debug = require('debug')(`index`);
const express = require('express');
const path = require('path');
const app = express();
const validateRequest = require('./helpers/check-token');
const article = require('./lib/article');
const hbs = require('hbs');

const exampleArticles = [
  {
    uuid: 'a48fedf2-3da0-11e8-b7e0-52972418fec4',
    text: 'non-News, about:PERSON'
  },
  {
    uuid: '225ad6d0-3be3-11e8-b7e0-52972418fec4',
    text: 'non-News, about:PERSON'
  },
  {
    uuid: '7ebe6812-4492-11e8-803a-295c97e6fd0b',
    text: 'non-News, pull-quote'
  },
  {
    uuid: 'b6303556-46c1-11e8-8ee8-cae73aab7ccb',
    text: 'GENRE=News'
  },
  {
    uuid: '769e57ae-463c-11e8-8ee8-cae73aab7ccb',
    text: 'GENRE=News, pull-quote'
  },
  {
    uuid: '66f99e1c-2143-11e8-9efc-0cd3483b8b80',
    text: 'GENRE=Opinion'
  },
  {
    uuid: '879d06d6-485d-11e8-8ae9-4b5ddcca99b3',
    text: 'GENRE=Opinion'
  },
];

app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.resolve(__dirname + "/public")));
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials');

var requestLogger = function (req, res, next) {
  debug("RECEIVED REQUEST:", req.method, req.url);
  next(); // Passing the request to the next handler in the stack.
}

app.use(requestLogger);

// these routes do *not* have s3o
app.get('/__gtg', (req, res) => res.sendStatus(200));

const TOKEN = process.env.TOKEN;
if (!TOKEN) {
  throw new Error('ERROR: TOKEN not specified in env');
}

// these route *do* use s3o
app.set('json spaces', 2);
if (process.env.BYPASS_TOKEN !== 'true') {
  app.use(validateRequest);
}

app.use('/article/:uuid', (req, res, next) => {
  const uuid = req.params.uuid;
  article.extractData(uuid)
  .then( data => {
    data['template'] = 'article';
    res.render('index', data);
  }).catch(e => {
      next(e);
  })
});

app.use('/articlejson/:uuid', (req, res, next) => {
  const uuid = req.params.uuid;
  article.extractData(uuid)
  .then( data => {
    res.json(data);
  }).catch(e => {
      next(e);
  })
});

app.use('/', (req, res) => {
  res.render('index', { template: 'home', exampleArticles } );
})

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

//---

function startListening() {
  app.listen(process.env.PORT, function () {
    console.log('Server is listening on port', process.env.PORT);
  });
}
//---
startListening();

module.exports = app;
