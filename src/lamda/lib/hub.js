/**
 * check event type, send event to different event handler
 */

import botauth from './bot-oauth'
import userauth from './user-oauth'
import bothook from './bot-webhook'
import userhook from './user-webhook'
import _ from 'lodash'
import {result, handleEvent, debug} from './common'

const mapper = {
  'bot-oauth': botauth,
  'user-oauth': userauth,
  'bot-webhook': bothook,
  'user-webhook': userhook
}

export default event => {
  debug('----------event get--------------')
  debug(event)
  debug('-----------event get-------------')
  let { action = 'alien' } = event.pathParameters || {}
  let handler = mapper[action] || handleEvent
  event.body = event.body || {}
  if (_.isString(event.body)) {
    event.body = JSON.parse(event.body)
  }
  event.queryStringParameters = event.queryStringParameters || {}
  return handler(event)

}
