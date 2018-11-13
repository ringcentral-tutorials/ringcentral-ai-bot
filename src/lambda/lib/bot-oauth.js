/**
 * user oauth by tyler
 */

import {result, delay} from './common'

import {Bot} from './store'

export default async (event) => {
  const bot = new Bot()
  await bot.authorize(event.queryStringParameters.code)
  await bot.renewWebHooks(event)
  return result('Bot added')
}

/**
 * bot renew mannually
 * @param {object} event
 */
export async function renewBot (event) {
  console.log('renew bot event')
  console.log(event)
  if(event.wait) {
    await delay(event.wait)
  }
  const bot = new Bot()
  bot.id = event.botId
  bot.token = event.token
  await bot.writeToDb()
  await bot.renewWebHooks()
  return result('Bot renew done')
}
