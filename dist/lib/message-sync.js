/**
 * do sync message
 */
const parseJSON = require('../common/json-parse')
const handleError = require('../common/error-handler')
const _ = require('lodash')
const {processVoiceMails} = require('./voicemail-reader')

function doOneSync (platform, {
  accountId = '~',
  extensionId = '~',
  recordCount = 10,
  messageType = 'VoiceMail',
  syncToken,
  syncType = 'ISync'
}) {
  let url = `/account/${accountId}/extension/${extensionId}/message-store` +
    `?recordCount=${recordCount}` +
    `&messageType=${messageType}` +
    '&perPage=3' +
    //`&syncToken=${syncToken}` +
    `&syncType=${syncType}`
  return platform.get(url)
    .then(parseJSON)
    .catch(handleError)
}

function shouldSyncVoiceMail(event) {
  let isStoreMsg = /\/account\/[\d~]+\/extension\/[\d~]+\/message-store/.test(
    _.get(event, 'body.event') || ''
  )
  if (!isStoreMsg) {
    return
  }
  let body = _.get(event, 'body.body') || {}
  let {changes = []} = body
  // only new voice mail counts
  let voiceMailUpdates = changes.filter(c => c.type === 'VoiceMail' && c.newCount > 0)
  if (voiceMailUpdates.length) {
    return {
      accountId: body.accountId || '~',
      extensionId: body.extensionId || '~'
    }
  }
}

async function syncVocieMail() {
  console.log('start fetch sync voice mail')
  let count = 100
  let syncRes = await doOneSync(
    global.bot.platform,
    {
      accountId: '~',
      extensionId: '~',
      messageType: 'VoiceMail',
      recordCount: count,
      syncToken: global.bot.syncToken || '',
      syncType: 'FSync'
    }
  )
  console.log(syncRes, 'syncRes')
  if (syncRes && syncRes.records) {
    processVoiceMails(syncRes.records)
  }
}

module.exports = {
  syncVocieMail
}
