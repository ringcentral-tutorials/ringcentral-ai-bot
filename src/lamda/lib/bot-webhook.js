/**
 * user oauth by tyler
 */

import {result, subscribeInterval} from './common'
import {User, store} from './store'

export default async (event) => {
  const message = event.body
  let { body } = message
  let msg = result('bot WebHook replied', 200, {
    headers: {
      'validation-token': event.headers['validation-token'] || event.headers['Validation-Token']
    }
  })
  if (!body) {
    return msg
  }

  let botId = message.ownerId

  //handle expire reminder event, resubscribe
  // if (message.event === subscribeInterval()) {
  //   let bot1 = await store.getBot(botId)
  //   if (bot1) {
  //     await bot1.renewWebHooks()
  //   }
  //   return msg
  // }

  switch (body.eventType) {

    //bot join group
    case 'GroupJoined':
      if (body.type === 'PrivateChat') {
        const bot = await store.getBot(botId)
        if (!bot) {
          break
        }
        await bot.sendMessage(
          body.id,
          {
            text: `Hello, I am a chatbot.
Please reply "![:Person](${botId})" if you want to talk to me.`
          }
        )
      }
      break

    //bot got post
    case 'PostAdded':

      //only respond to @bot event
      if (body.creatorId === botId || body.text.indexOf(`![:Person](${botId})`) === -1) {
        break
      }
      var bot = await store.getBot(botId)

      //no bot in database
      if (!bot) {
        return
      }

      //user unmonit voicemail
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
      }

      //user monit voicemail
      else if (/\bmonitor\b/i.test(body.text)) { // monitor voicemail
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
      }

      //other situation, just tip user to monit
      else {
        await bot.sendMessage(body.groupId, {
          text: `If you want me to monitor your voicemail, please reply "![:Person](${botId}) monitor"`
        })
      }
      break
    default:
      break
  }

  return msg
}
