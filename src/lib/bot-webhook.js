/**
 * user oauth by tyler
 */
import RingCentral from 'ringcentral-js-concise'
import result from './response'
const {
  RINGCENTRAL_USER_CLIENT_ID,
  RINGCENTRAL_SERVER,
  RINGCENTRAL_BOT_SERVER
} = require('../config.default')

console.log(RINGCENTRAL_USER_CLIENT_ID, RINGCENTRAL_SERVER, RINGCENTRAL_BOT_SERVER)
const {store} = global.bot

export default async (event) => {
  const message = event.body
  console.log('Message received via bot WebHook:', message)
  const botId = message.ownerId
  const {body} = message
  if (body) {
    switch (body.eventType) {
      case 'GroupJoined':
        if (body.type === 'PrivateChat') {
          const token = store.botTokens[botId]
          console.log(token, 'bot token')
          const rc = new RingCentral('', '', RINGCENTRAL_SERVER)
          rc.token(token)
          await rc.post(
            '/restapi/v1.0/glip/posts',
            {
              text: 'Hello, you just started a new conversation with the bot!'
            }
          )
        }
        break
      case 'PostAdded':
        if (body.creatorId !== botId) { // Bot should not respond to himself
          const botToken = store.botTokens[botId]
          const botRc = new RingCentral('', '', RINGCENTRAL_SERVER)
          botRc.token(botToken)
          const userToken = store.userTokens[body.creatorId]
          if (userToken) {
            await botRc.post(
              `/restapi/v1.0/glip/groups/${body.groupId}/posts`,
              {
                text: 'Got it!'
              }
            )
          } else {
            const userRc = new RingCentral(
              RINGCENTRAL_USER_CLIENT_ID,
              '',
              RINGCENTRAL_SERVER
            )
            const authorizeUri = userRc.authorizeUri(
              RINGCENTRAL_BOT_SERVER + '/user-oauth',
              {
                state: body.groupId + ':' + botId,
                responseType: 'code'
              }
            )
            await botRc.post(
              `/restapi/v1.0/glip/groups/${body.groupId}/posts`,
              {
                text: `Please [click here](${authorizeUri}) to authorize me to access your RingCentral data`
              }
            )
          }
        }
        break
      default:
        break
    }
  }
  return result('WebHook replied', 200, {
    headers: {
      'validation-token': event.headers['validation-token']
    }
  })
}
