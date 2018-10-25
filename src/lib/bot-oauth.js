/**
 * user oauth by tyler
 */

import result from './response'

import store, { Bot } from './store'

export default async (event) => {
  const bot = new Bot()
  await bot.authorize(event.queryStringParameters.code)
  store.addBot(bot)
  await bot.setupWebHook()
  return result('Bot added')
}
