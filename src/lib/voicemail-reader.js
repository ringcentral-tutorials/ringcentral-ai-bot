/**
 * read voicemail and process it
 */

/**
 * filter voicemail
 * @param {array} events
 */

import {speech2text} from './speech2text'
import _ from 'lodash'
import {textAnalysis} from './text-analysis'

export async function processMail(mail, rc) {
  let text = await speech2text(
    rc,
    _.get(mail, 'attachments[0].uri'),
    _.get(mail, 'attachments[0].id')
  )
  if (
    _.isString(text)
  ) {
    let result = await textAnalysis(text)
    console.log('analysis result', result)
    return result
  }

}

