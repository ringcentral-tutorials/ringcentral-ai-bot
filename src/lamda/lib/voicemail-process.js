/**
 * read voicemail and process it
 */

import _ from 'lodash'
import {speech2text} from 'audio-analysis-service/dist/url2text'
import {textAnalysis} from 'audio-analysis-service/dist/text-analysis'
import {store} from './store'
import {log} from './common'
import crypto from 'crypto'

/**
 * process voice mail
 * @param {object} mail
 * @param {object} rc
 */
export async function processMail (mail, headers) {
  let url = _.get(mail, 'attachments[0].uri')
  if (!url) {
    return ''
  }
  let md5 = crypto.createHash('md5').update(url).digest('hex')
  let cached = await store.getCache(md5)
  if (cached) {
    log('use cache for', url, md5)
    return cached
  }
  let text = await speech2text(
    url, headers
  )
  if (
    !_.isString(text)
  ) {
    return ''
  }
  let result = await textAnalysis(text)
  if (!result || !result.text) {
    return ''
  }
  await store.addCache({
    id: md5,
    result
  })
  return result
}
