const fetchContent = require('../lib/fetchContent');
const debug = require('debug')('routes:article');
const extractText = require('../utils/extract-text');

function extractData(uuid) {
  return fetchContent.getArticle(uuid)
  .then(content => {
    const essencePhrases = [];  // Candidates for the 'essence' of the article.
    const context = [];         // Potentially useful info for spotting essences.

    essencePhrases.push(
      {'type': 'Title', text: content.title},
      {'type': 'Standfirst', text: content.standfirst}
    );

    const genre = content.annotations.find(object => {
      return object.type === 'GENRE'
    });
    const text = extractText(content.bodyXML);
    const splitText = text.match(/[^\.!\?]+[\.!\?]+/g);
    const allParagraphs = content.bodyXML.match(/<p>([\s\S]+?)<\/p>/g);
    const nonEmptyParas = allParagraphs.filter( p => { return extractText(p) !== ""; });

    if( ! genre ){
      context.push({'type': 'GENRE', text: 'unknown' });
    } else {
      context.push({'type': 'GENRE', text: genre.prefLabel });

      if (genre.prefLabel === 'News') {
        const firstSentence = text.match(/(^.*?[a-z]{2,}[.!?])\s+\W*[A-Z]/)[1];
        essencePhrases.push({'type': 'First sentence', text: firstSentence});
      } else if (genre.prefLabel === 'Opinion') {
        // ignore all pars after and including the first para containing a mailto to an ft email address
        const mailtoIndex = nonEmptyParas.findIndex( p => { return p.match(/mailto[\s\S]*@ft\.com/); });
        const parasBeforeMailto = (mailtoIndex > -1)? nonEmptyParas.slice(0,mailtoIndex) : nonEmptyParas;
        if (parasBeforeMailto.length > 0) {
          if (parasBeforeMailto.length > 1) {
            essencePhrases.push({'type': 'Penultimate sentence', text: extractText(parasBeforeMailto[parasBeforeMailto.length -2])});
          }
          essencePhrases.push({'type': 'Last sentence', text: extractText(parasBeforeMailto[parasBeforeMailto.length -1])});
        }
      }
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
        descriptions: [
          'essencePhrases: the early attempts to highlight fragments of text which cut to the essence of the article.',
          'context: assorted attributes which might be useful in capturing the essence.',
        ],
        essencePhrases,
        context,
        text,
        bodyXML: content.bodyXML,
        uuid,
        url: `https://www.ft.com/content/${uuid}`,
        content,
      };
  })
  .catch(err => {
    console.log( debug(err) );
  });
}

module.exports = {
  extractData
};
