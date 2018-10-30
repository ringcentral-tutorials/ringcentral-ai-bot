/**
 * user oauth by tyler
 */

import result from './response'

import { Bot, getStore } from './store'

export default async (event) => {
  const bot = new Bot()
  await bot.authorize(event.queryStringParameters.code)
  const store = await getStore()
  store.addBot(bot)
  await bot.renewWebHooks()
  return result('Bot added')
}
