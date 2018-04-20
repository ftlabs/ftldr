# FTLDR

Outputs suggestions for phrases that could be used as a very short summary of an article. An experiment in anticipation of extreme summarisation. Currently suggests the title, standfirst and, for news articles, the first sentence.

## Installation

Configure the mandatory environment variables in a .env file. These are:
* CAPI_KEY=
* TOKEN= # for authoriseded access without S3O or IP range. Can be set to noddy value for development.
* PORT= # auto set in Heroku, but needs specifying for development.

Run `npm install` to install the dependencies and then `npm start` to start the server.
