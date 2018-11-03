/**
 * sync message related
 */
import _ from 'lodash'

const env = process.env.NODE_ENV

export function log(...args) {
  console.log(
    '' + new Date().toISOString(),
    ...args
  )
}

export function debug(...args) {
  if (env !== 'production') {
    console.log(
      '' + new Date(),
      ...args
    )
  }
}

/**
 * response helper
 */
export function result (
  msg,
  status = 200,
  options = {}
) {
  return {
    statusCode: status,
    body: msg,
    ...options
  }
}

export const subscribeInterval = () => '/restapi/v1.0/subscription/~?threshold=59&interval=15'
export const expiresIn = () => process.env.SUBSCRIBE_EXPIRE
  ? parseInt(process.env.SUBSCRIBE_EXPIRE)
  : 1799

export function shouldSyncVoiceMail (event) {
  let isStoreMsg = /\/account\/[\d~]+\/extension\/[\d~]+\/message-store/.test(
    _.get(event, 'body.event') || ''
  )
  if (!isStoreMsg) {
    return
  }
  let body = _.get(event, 'body.body') || {}
  let { changes = [] } = body
  // only new voice mail counts
  let voiceMailUpdates = changes.filter(c => c.type === 'VoiceMail' && c.newCount > 0)
  return voiceMailUpdates.length
}

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
  return '\n**Entity sentiment:**\n\n' +
    entitySentiments.reduce((prev, entity) => {
      return prev + `* Name: ${entity.name}, Type: ${entity.type}, Score: ${entity.sentiment.score}, Magnitude: ${entity.sentiment.magnitude}\n`
    }, '')
}

export function resultFormatter (userId, result) {
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

/**
 * handle event not userful
 */
export function handleEvent (evt) {
  return {
    statusCode: 200,
    body: JSON.stringify(evt)
  }
}

export const tables = [
  'bot',
  'user',
  'cache'
]

export const dynamodbDefinitions = {
  user: {
    id: ['S', 'HASH', 'string']
  },
  bot: {
    id: ['S', 'HASH', 'string']
  },
  cache: {
    id: ['S', 'HASH']
  }
}

export function handleRCError(type, e) {
  log(
    type,
    'error',
    _.get(e.response.data) || e.stack
  )
}
