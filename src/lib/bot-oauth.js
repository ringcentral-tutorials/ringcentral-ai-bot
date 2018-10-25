/**
 * user oauth by tyler
 */
import RingCentral from 'ringcentral-js-concise'
import {setupBotWebHook} from './bot-setup'
import result from './response'
const {
  RINGCENTRAL_BOT_CLIENT_ID,
  RINGCENTRAL_BOT_CLIENT_SECRET,
  RINGCENTRAL_SERVER,
  RINGCENTRAL_BOT_SERVER
} = require('../config.default')

const {store} = global.bot

export default async (event) => {
  console.log('bot uath get')
  const rc = new RingCentral(
    RINGCENTRAL_BOT_CLIENT_ID,
    RINGCENTRAL_BOT_CLIENT_SECRET,
    RINGCENTRAL_SERVER
  )
  const {code = ''} = event.queryStringParameters
  try {
    let xx = await rc.authorize({
      code,
      redirectUri: RINGCENTRAL_BOT_SERVER + '/bot-oauth'
    })
  } catch (e) {
    console.log(JSON.stringify(e.response.data, null, 2))
  }
  const token = rc.token()
  console.log(token)
  store.botTokens[token.owner_id] = token

  await setupBotWebHook(token)

  return result('Bot added')
}
