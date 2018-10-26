/**
 * check event type, send event to different event handler
 */

import botauth from './bot-oauth'
import userauth from './user-oauth'
import bothook from './bot-webhook'
import userhook from './user-webhook'
import alien from './handle-alien-event'

const mapper = {
  'bot-oauth': botauth,
  'user-oauth': userauth,
  'bot-webhook': bothook,
  'user-webhook': userhook
}

export default async event => {
  // console.log('----------event get--------------')
  // console.log(event)
  // console.log('-----------event get-------------')
  let { action = 'alien' } = event.pathParameters || {}
  let handler = mapper[action] || alien
  event.body = event.body || {}
  event.queryStringParameters = event.queryStringParameters || {}
  return await handler(event)
}
