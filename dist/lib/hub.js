/**
 * check event type, send event to different event handler
 */

const subscribe = require('./subscribe')
const userauth = require('./user-auth')
const voicemail = require('./voice-mail')
const alien = require('./handle-alien-event')
const mapper = {
  subscribe,
  userauth,
  voicemail,
  alien
}

module.exports = event => {
  let {action = 'alien'} = event.pathParameters || {}
  let handler = mapper[action]
  return handler(event)
}
