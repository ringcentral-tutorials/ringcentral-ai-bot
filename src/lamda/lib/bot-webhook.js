/**
 * user oauth by tyler
 */

import {result, subscribeInterval} from './common'
import {User, store} from './store'

export default async (event) => {
  const message = event.body
  //console.log('Message received via bot WebHook:', JSON.stringify(message, null, 2))

  let { body } = message
  if (body) {
    let botId = message.ownerId
    if (message.event === subscribeInterval()) {
      let bot1 = await store.getBot(botId)
      if (bot1) {
        await bot1.renewWebHooks()
      }
    } else {
      switch (body.eventType) {
        case 'GroupJoined':
          if (body.type === 'PrivateChat') {
            const bot = await store.getBot(botId)
            if (!bot) {
              break
            }
            await bot.sendMessage(body.id, { text: `Hello, I am a chatbot.
  Please reply "![:Person](${botId})" if you want to talk to me.` })
          }
          break
        case 'PostAdded':
          if (body.creatorId === botId || body.text.indexOf(`![:Person](${botId})`) === -1) {
            break
          }
          var bot = await store.getBot(botId)
          if (!bot) {
            return
          }
          if (/\bunmonitor\b/i.test(body.text)) { // monitor voicemail
            const user = await store.getUser(body.creatorId)
            if (user) {
              await user.removeGroup(body.groupId)
              await bot.sendMessage(body.groupId, { text: `![:Person](${body.creatorId}), stop monitor your voicemail now!\nIf you want me to monitor your voicemail again, please reply "![:Person](${botId}) monitor"` })
            } else {
              await bot.sendMessage(body.groupId, {
                text: `![:Person](${body.creatorId}), If you want me to monitor your voicemail, please reply "![:Person](${botId}) monitor" first.`
              })
            }
          } else if (/\bmonitor\b/i.test(body.text)) { // monitor voicemail
            const user = await store.getUser(body.creatorId)
            if (user) {
              await user.addGroup(body.groupId, botId)
              await bot.sendMessage(body.groupId, { text: `![:Person](${body.creatorId}), now your voicemail is monitored!\nIf you want me to **stop monitor** your voicemail, please reply "![:Person](${botId}) unmonitor"` })
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
