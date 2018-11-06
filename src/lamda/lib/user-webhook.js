/**
 * user oauth by tyler
 */

import {result, subscribeInterval, shouldSyncVoiceMail} from './common'
import {store} from './store'
import _ from 'lodash'

export default async (event) => {
  let message = event.body
  let newMailCount = shouldSyncVoiceMail(event)
  let isRenewEvent = _.get(message, 'event') === subscribeInterval()
  if (newMailCount || isRenewEvent) {
    const userId = (message.body.extensionId || message.ownerId).toString()
    const user = await store.getUser(userId)

    // get reminder event, do token renew and subscribe renew
    if (user && isRenewEvent) {
      await user.renewWebHooks()
      await user.refresh()
    }

    // get new voicemail, process the email and send to chat group
    // todo: comment out line26-28, uncomment line31-40
    // todo: replace line26-28, use you own process function, send some custom reponse about new voice mail
    else if (user) {
      await user.processVoiceMail(newMailCount)
    }

    // replace line34-36 with this section, which will only tell chat group how many new voicemail we get
    // else if (user) {
    //   for (const groupId of Object.keys(user.groups)) {
    //     const botId = user.groups[groupId]
    //     const bot = await store.getBot(botId)
    //     await bot.sendMessage(
    //       groupId,
    //       { text: `![:Person](${userId}), you got ${newMailCount} new voiceMail! `}
    //     )
    //   }
    // }

  }
  return result('WebHook got', 200, {
    headers: {
      'validation-token': event.headers['validation-token'] || event.headers['Validation-Token']
    }
  })
}
