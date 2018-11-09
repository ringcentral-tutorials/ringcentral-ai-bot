/**
 * user oauth by tyler
 */

import {result} from './common'

import {Bot} from './store'

export default async (event) => {
  const bot = new Bot()
  await bot.authorize(event.queryStringParameters.code)
  await bot.renewWebHooks()
  return result('Bot added')
}
