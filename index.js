const dotenv = require('dotenv').config({ silent: process.env.NODE_ENVIRONMENT === 'production' });
const debug = require('debug')(`index`);
const express = require('express');
const path = require('path');
const app = express();
const validateRequest = require('./helpers/check-token');
const article = require('./routes/article');
const hbs = require('hbs');


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


app.use('/article', article);


app.use('/', (req, res) => {
  res.render('index', {template: 'home'});
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
