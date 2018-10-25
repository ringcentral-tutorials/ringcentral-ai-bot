/**
 * user oauth by tyler
 */
import RingCentral from 'ringcentral-js-concise'
import result from './response'
const {
  RINGCENTRAL_USER_CLIENT_ID,
  RINGCENTRAL_USER_CLIENT_SECRET,
  RINGCENTRAL_SERVER,
  RINGCENTRAL_BOT_SERVER
} = require('../config.default')

const {store} = global.bot

export default async (event) => {
  const userRc = new RingCentral(
    RINGCENTRAL_USER_CLIENT_ID,
    RINGCENTRAL_USER_CLIENT_SECRET,
    RINGCENTRAL_SERVER
  )
  const {code} = event.queryStringParameters
  const [groupId, botId] = event.queryStringParameters.state.split(':')
  console.log(code, 'code')
  console.log(`User tried to authorize from Glip group ${groupId} for bot ${botId}`)
  try {
    await userRc.authorize({
      code,
      redirectUri: RINGCENTRAL_BOT_SERVER + '/user-oauth'
    })
  } catch (e) {
    console.log(JSON.stringify(e.response.data, null, 2))
  }
  const token = userRc.token()
  console.log('userRc', token)
  store.userTokens[token.owner_id] = token

  // todo: setup user voicemail webhook

  const botRc = new RingCentral(
    '',
    '',
    RINGCENTRAL_SERVER
  )
  botRc.token(store.botTokens[botId])
  await botRc.post(
    `/restapi/v1.0/glip/groups/${groupId}/posts`,
    {
      text: 'You have successfully authorized me to access your RingCentral data!'
    }
  )
  return result(
    'You have authorized the bot to access your RingCentral data! Please close this page and get back to Glip'
  )
}
