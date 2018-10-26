/**
 * format google NLP analysis result to glip message string
 */

function sentimentRender(sentiment) {
  if (!sentiment) {
    return ''
  }
  return '\n**Sentiment:**\n\n' +
  `* Sentiment score: ${sentiment.score}\n` +
  `* Sentiment magnitude: ${sentiment.magnitude}\n`
}

function syntaxRender(syntax) {
  if (!syntax) {
    return ''
  }
  return '\n**Syntax:**\n\n' +
    syntax.tokens.reduce((prev, part) => {
      return prev + `* ${part.partOfSpeech.tag}: ${part.text.content}\n`
    }, '')
}

function classificationRender(classification) {
  if (!classification) {
    return ''
  }
  return '\n**Classification:**\n\n' +
    classification.categories.reduce((prev, category) => {
      return prev + `* Name: ${category.name}, Confidence: ${category.confidence}\n`
    }, '')
}

function entitySentimentsRender(entitySentiments) {
  if (!entitySentiments) {
    return ''
  }
  return '\n**entity sentiment:**\n\n' +
    entitySentiments.reduce((prev, entity) => {
      return prev + `* Name: ${entity.name}, Type: ${entity.type}, Score: ${entity.sentiment.score}, Magnitude: ${entity.sentiment.magnitude}\n`
    }, '')
}

export default (userId, result) => {
  let {
    text,
    sentiment,
    syntax,
    entitySentiments,
    classification
  } = result
  return `![:Person](${userId}), you got a new voiceMail!\n\n` +
  `Voice mail text: **${text}**\n\n` +
  'And we did some analysis to the text, here is some result:\n' +
  classificationRender(classification) +
  entitySentimentsRender(entitySentiments) +
  syntaxRender(syntax) +
  sentimentRender(sentiment)
}
