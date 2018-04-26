# FTLDR

Outputs suggestions for phrases that could be used as a very short summary of an article. An experiment in anticipation of extreme summarisation.
Currently suggests:
- Title
- Standfirst
- Pull quotes
- the first sentence for news articles
- for articles tagged as about a person, any sentence mentioning that person
- for opinion articles, the last and penultimate sentences.

Use it at https://ftlabs-ftldr.herokuapp.com/.

## Installation

Configure the mandatory environment variables in a .env file. These are:
* CAPI_KEY=
* TOKEN= # for authorised access without S3O or IP range. Can be set to noddy value for development.
* PORT= # auto set in Heroku, but needs specifying for development.

Run `npm install` to install the dependencies and then `npm start` to start the server.
