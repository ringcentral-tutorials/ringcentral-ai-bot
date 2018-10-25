/**
 * sync message related
 */
import _ from 'lodash'

export function shouldSyncVoiceMail (event) {
  let isStoreMsg = /\/account\/[\d~]+\/extension\/[\d~]+\/message-store/.test(
    _.get(event, 'body.event') || ''
  )
  if (!isStoreMsg) {
    return
  }
  let body = _.get(event, 'body.body') || {}
  let { changes = [] } = body
  // only new voice mail counts
  let voiceMailUpdates = changes.filter(c => c.type === 'VoiceMail' && c.newCount > 0)
  return voiceMailUpdates.length
}
