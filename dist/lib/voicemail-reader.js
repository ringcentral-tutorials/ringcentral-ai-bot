/**
 * read voicemail and process it
 */

/**
 * filter voicemail
 * @param {array} events
 */

const {speech2text} = require('./speech2text')
const _ = require('lodash')
const {textAnalysis} = require('./text-analysis')
const UNREAD = 'unread'

async function filterVoiceMail(mails) {
  let lastSyncedVoiceMailIds = await getLastSyncedVoiceMailIds()
  return mails.filter(v => {
    console.log(v.attachments)
    return _.get(v, 'attachments[0].uri')
  })
}

async function getLastSyncedVoiceMailIds() {
  //todo
  return global.bot.lastSyncedVoiceMailIds || []
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

module.exports = {
  processVoiceMails
}
