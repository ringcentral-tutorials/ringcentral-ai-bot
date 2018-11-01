/**
 * run longer time for code init to finish
 */

import wait from '../common/wait'
import result from './response'
import { getStore } from './store'

export default async (event) => {
  let ms = event.queryStringParameters.ms || 60 * 1000
  await getStore()
  await wait(ms)
  return result('done')
}
