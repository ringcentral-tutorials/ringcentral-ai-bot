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
      const sentiment = results[0].documentSentiment
      console.log('Sentiment:', sentiment)
      console.log(`Sentiment score: ${sentiment.score}`)
      console.log(`Sentiment magnitude: ${sentiment.magnitude}`)
      return sentiment
    })
    .catch(err => {
      console.error('Sentiment api ERROR:', err)
    })

  // syntax
  let syntax = await client
    .analyzeSyntax({ document: document })
    .then(results => {
      const syntax = results[0]
      console.log('Tokens:')
      syntax.tokens.forEach(part => {
        console.log(`${part.partOfSpeech.tag}: ${part.text.content}`)
        console.log('Morphology:', part.partOfSpeech)
      })
      return syntax
    })
    .catch(err => {
      console.error('syntax api ERROR:', err)
    })

  // Detects sentiment of entities in the document
  let entitySentiments = await client
    .analyzeEntitySentiment({ document: document })
    .then(results => {
      const entities = results[0].entities
      console.log('Entities and sentiments:')
      entities.forEach(entity => {
        console.log(`  Name: ${entity.name}`)
        console.log(`  Type: ${entity.type}`)
        console.log(`  Score: ${entity.sentiment.score}`)
        console.log(`  Magnitude: ${entity.sentiment.magnitude}`)
      })
      return entities
    })
    .catch(err => {
      console.error('entitySentiments api ERROR:', err)
    })

  // Classifies text in the document
  let classification = await client
    .classifyText({ document: document })
    .then(results => {
      const classification = results[0]
      console.log('Categories:')
      classification.categories.forEach(category => {
        console.log(
          `Name: ${category.name}, Confidence: ${category.confidence}`
        )
      })
      return classification
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
