/**
 * check event type, send event to different event handler
 */

const botauth = require('./bot-oauth')
const userauth = require('./user-oauth')
const bothook = require('./bot-webhook')

//const glip = require('./glip')
const alien = require('./handle-alien-event')
const mapper = {
  'bot-oauth': botauth,
  'user-oauth': userauth,
  'bot-webhook': bothook
}

module.exports = event => {
  console.log('----------event get--------------')
  console.log(event)
  console.log('-----------event get-------------')
  let {action = 'alien'} = event.pathParameters || {}
  let handler = mapper[action] || alien
  return handler(event)
}
