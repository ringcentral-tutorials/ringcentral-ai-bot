/**
 * do sync message
 */
import R from 'ramda'
import handleError from '../common/error-handler'
import RingCentral from 'ringcentral-js-concise'
import _ from 'lodash'
import {processVoiceMails} from './voicemail-reader'

const {store} = global.bot

function doOneSync (platform, opts) {
  let url = '/restapi/v1.0/account/~/extension/~/message-sync'
  return platform.get(url, {
    queryParam: opts
  })
    .catch(handleError)
}

export function shouldSyncVoiceMail(event) {
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

export async function syncVocieMail(event) {
  console.log('start fetch sync voice mail')
  let token = store.userTokens[event.body.owner_id]
  const rc = new RingCentral('', '', process.env.RINGCENTRAL_SERVER)
  rc.token(token)
  let count = 100
  let syncRes = await doOneSync(
    rc,
    {
      accountId: '~',
      extensionId: '~',
      messageType: 'VoiceMail',
      recordCount: count,
      syncType: 'FSync'
    }
  )
  if (syncRes && syncRes.data.records) {
    processVoiceMails(syncRes.data.records, rc)
  }
}

// R.keys(store.userTokens).forEach(async id => {
//   await syncVocieMail({
//     body: {
//       owner_id: id
//     }
//   })
// })
