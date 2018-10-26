/**
 * analysis text with google ai
 */

// Imports the Google Cloud client library
import language from '@google-cloud/language'

// Instantiates a client
const client = new language.LanguageServiceClient()

export async function textAnalysis (text) {
  const document = {
    content: text,
    type: 'PLAIN_TEXT'
  }

  // Detects the sentiment of the text
  let sentiment = await client
    .analyzeSentiment({ document: document })
    .then(results => {
      return results[0].documentSentiment
    })
    .catch(err => {
      console.error('Sentiment api ERROR:', err)
    })

  // syntax
  let syntax = await client
    .analyzeSyntax({ document: document })
    .then(results => {
      return results[0]
    })
    .catch(err => {
      console.error('syntax api ERROR:', err)
    })

  // Detects sentiment of entities in the document
  let entitySentiments = await client
    .analyzeEntitySentiment({ document: document })
    .then(results => {
      return results[0].entities
    })
    .catch(err => {
      console.error('entitySentiments api ERROR:', err)
    })

  // Classifies text in the document
  let classification = await client
    .classifyText({ document: document })
    .then(results => {
      return results[0]
    })
    .catch(err => {
      console.error('classifies ERROR:', err)
    })

  return {
    text,
    sentiment,
    syntax,
    entitySentiments,
    classification
  }
}
