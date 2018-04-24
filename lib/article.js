const fetchContent = require('../lib/fetchContent');
const debug = require('debug')('routes:article');
const extractText = require('../utils/extract-text');

function extractData(uuid) {
  return fetchContent.getArticle(uuid)
  .then(content => {
    const essencePhrases = [];
    const context = [];
    essencePhrases.push(
      {'type': 'Title', text: content.title},
      {'type': 'Standfirst', text: content.standfirst}
    );

    const type = content.annotations.find(object => {
      return object.type === 'GENRE'
    });
    const text = extractText(content.bodyXML);

    if( type ){
      if (type.prefLabel === 'News') {
        const firstSentence = text.match(/(^.*?[a-z]{2,}[.!?])\s+\W*[A-Z]/)[1];
        essencePhrases.push({'type': 'First sentence', text: firstSentence});
      }
      context.push({'type': 'GENRE', text: type.prefLabel });
    } else {
      context.push({'type': 'GENRE', text: 'unknown' });
    }

    const annotations = {}; // {predictate}{type}[label]
    content.annotations.map( anno => {
      const predicate = anno.predicate.split('/').pop();
      const type      = anno.type;
      const label     = anno.prefLabel;

      if (! annotations.hasOwnProperty(predicate) ) {
        annotations[predicate] = {};
      }
      if (! annotations[predicate].hasOwnProperty(type) ) {
        annotations[predicate][type] = [];
      }

      annotations[predicate][type].push( label );
    });

    const splitText = text.match(/[^\.!\?]+[\.!\?]+/g);
    if (annotations.about.PERSON) {
      const person = annotations.about.PERSON[0];
      const fullNameMentions = splitText.filter(subString => subString.includes(person));

      fullNameMentions.map((mention, i) => {
        essencePhrases.push( { 'type': `Full Name mentioned${i+1}`, text: mention });
      });
    }

    Object.keys(annotations).sort().map( predicate => {
      Object.keys(annotations[predicate]).map( type => {
        const labels = annotations[predicate][type].join(', ');
        context.push( {'type' : `annotation:${predicate}:${type}`, 'text': labels } );
      });
    });

    // Look for Pull Quotes
    // <pull-quote><pull-quote-text><p>You are talking about labour abuse. You saw pictures of people kept in cages, which is completely unacceptable</p></pull-quote-text><pull-quote-source>Thiraphong Chansiri</pull-quote-source></pull-quote>
    const pqMatches = content.bodyXML.match(/<pull-quote>(.*?)<\/pull-quote>/g);
    if (pqMatches) {
      const pullQuotes = pqMatches.map( pqm => {
        const pqtMatch = pqm.match(/<pull-quote-text>(.*)<\/pull-quote-text>/);
        const pqsMatch = pqm.match(/<pull-quote-source>(.*)<\/pull-quote-source>/);
        if (pqtMatch) {
          var pq = { text: extractText(pqtMatch[1]) };
          if (pqsMatch) {
            pq['text2'] = `- ${pqsMatch[1]}`;
          }
          return pq;
        }
      }).filter( t => t );

      pullQuotes.map((pq, i) => {
        pq['type'] = `PullQuote${i+1}`;
        essencePhrases.push(pq);
      });
    }

    return {
        content,
        essencePhrases,
        context,
        text,
        bodyXML: content.bodyXML,
        uuid,
        url: `https://www.ft.com/content/${uuid}`
      };
  })
  .catch(err => {
    console.log( debug(err) );
  });
}

module.exports = {
  extractData
};
