/**
 * check event type, send event to different event handler
 */

const botauth = require('./bot-auth')
const userauth = require('./user-auth')
const glip = require('./glip')
const alien = require('./handle-alien-event')
const mapper = {
  botauth,
  userauth,
  glip,
  alien
}

module.exports = event => {
  let {action = 'alien'} = event.pathParameters || {}
  let handler = mapper[action] || alien
  return handler(event)
}
