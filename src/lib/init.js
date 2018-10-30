/**
 * when got event, init
 */

import {getStore} from './store'
import result from './response'
import * as R from 'ramda'



export default async () => {

  let store = await getStore()
  let now = + new Date()
  let {lastInitTime} = store
  let diff = now - lastInitTime
  const threshold = 5 * 1000
  if (diff < threshold) {
    return result(diff)
  }

  // init bots
  for (const k of R.keys(store.bots)) {
    const bot = store.bots[k]
    await bot.renewWebHooks()
  }

  // init users
  for (const k of R.keys(store.users)) {
    const user = store.users[k]
    await user.renewWebHooks()
    await user.refresh()
  }

  store.lastInitTime = + new Date()

  return result('init done')
}
