/**
 * check event type, send event to different event handler
 */

import botauth from './bot-oauth'
import userauth from './user-oauth'
import bothook from './bot-webhook'
import userhook from './user-webhook'
import alien from './handle-alien-event'
import persistantRun from './persist-run'
import _ from 'lodash'
import {log} from './log'

const mapper = {
  'bot-oauth': botauth,
  'user-oauth': userauth,
  'bot-webhook': bothook,
  'user-webhook': userhook,
  run: persistantRun
}

export default event => {
  log('----------event get--------------')
  log(event)
  log('-----------event get-------------')
  let { action = 'alien' } = event.pathParameters || {}
  let handler = mapper[action] || alien
  event.body = event.body || {}
  if (_.isString(event.body)) {
    event.body = JSON.parse(event.body)
  }
  event.queryStringParameters = event.queryStringParameters || {}
  return handler(event)
}
