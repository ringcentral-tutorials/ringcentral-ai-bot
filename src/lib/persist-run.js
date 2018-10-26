/**
 * run longer time for code init to finish
 */

import wait from '../common/wait'
import result from './response'

export default async (event) => {
  let ms = event.queryStringParameters.ms || 60 * 1000
  console.log('run, wating', ms)
  await wait(ms)
  console.log('wait end')
  return result('done')
}
