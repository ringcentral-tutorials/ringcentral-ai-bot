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

async function filterVoiceMail(mails) {
  return mails.filter(v => {
    console.log(v.attachments)
    return _.get(v, 'attachments[0].uri')
  })
}

async function processVoiceMails(mails) {
  let filtered = await filterVoiceMail(mails)
  console.log('filtered', filtered)
  for (let evt of filtered) {
    let text = await speech2text(
      _.get(evt, 'attachments[0].uri'),
      _.get(evt, 'attachments[0].id')
    )
    if (
      _.isString(text)
    ) {
      let result = await textAnalysis(text)
      console.log('analysis result', result)
    }
  }
}

export default {
  processVoiceMails
}
