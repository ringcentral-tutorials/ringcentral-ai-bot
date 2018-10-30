/**
 * user oauth by tyler
 */

import result from './response'
import { User, getStore } from './store'
//import {debug} from './log'

import {subscribeInterval} from '../common/constants'

export default async (event) => {
  const message = event.body
  //console.log('Message received via bot WebHook:', JSON.stringify(message, null, 2))

  let { body } = message
  if (body) {
    const store = await getStore()
    let botId = message.ownerId
    if (message.event === subscribeInterval) {
      let bot1 = store.getBot(botId)
      await bot1.renewSubscription(message.subscriptionId)
    } else {
      switch (body.eventType) {
        case 'GroupJoined':
          if (body.type === 'PrivateChat') {
            const bot = store.getBot(botId)
            await bot.sendMessage(body.id, { text: `Hello, I am a chatbot.
  Please reply "![:Person](${botId})" if you want to talk to me.` })
          }
          break
        case 'PostAdded':
          if (body.creatorId === botId || body.text.indexOf(`![:Person](${botId})`) === -1) {
            break
          }
          var bot = store.getBot(botId)
          if (/\bmonitor\b/i.test(body.text)) { // monitor voicemail
            const user = store.getUser(body.creatorId)
            if (user) {
              await user.addGroup(body.groupId, botId)
              await bot.sendMessage(body.groupId, { text: `![:Person](${body.creatorId}), now your voicemail is monitored!` })
            } else {
              const user = new User()
              const authorizeUri = user.authorizeUri(body.groupId, botId)
              await bot.sendMessage(body.groupId, {
                text: `![:Person](${body.creatorId}), [click here](${authorizeUri}) to authorize me to access your RingCentral data first.`
              })
            }
          } else {
            await bot.sendMessage(body.groupId, {
              text: `If you want me to monitor your voicemail, please reply "![:Person](${botId}) monitor"`
            })
          }
          break
        default:
          break
      }
    }
  }
  return result('bot WebHook replied', 200, {
    headers: {
      'validation-token': event.headers['validation-token'] || event.headers['Validation-Token']
    }
  })
}
