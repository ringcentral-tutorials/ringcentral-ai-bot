/**
 * user oauth by tyler
 */

import result from './response'
import store, { User } from './store'

export default async (event) => {

  const user = new User()
  await user.authorize(event.queryStringParameters.code)
  store.addUser(user)
  const [groupId, botId] = event.queryStringParameters.state.split(':')
  const bot = store.getBot(botId)

  await bot.sendMessage(groupId, { text: `![:Person](${user.token.owner_id}), you have successfully authorized me to access your RingCentral data!` })

  await user.addGroup(groupId, botId)
  await bot.sendMessage(groupId, { text: `![:Person](${user.token.owner_id}), your voiceMail is monitored!` })

  return result(
    'You have authorized the bot to access your RingCentral data! Please close this page and get back to Glip'
  )
}
