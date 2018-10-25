/**
 * user oauth by tyler
 */
import RingCentral from 'ringcentral-js-concise'
import result from './response'
import _ from 'lodash'
import {shouldSyncVoiceMail, syncVocieMail} from './message-sync'
import R from 'ramda'
import parseJSON from '../common/json-parse'
import handleError from '../common/error-handler'

const {
  RINGCENTRAL_USER_CLIENT_ID,
  RINGCENTRAL_SERVER,
  RINGCENTRAL_BOT_SERVER
} = process.env

const {store} = global.bot

async function delAllSubcribe(token) {
  const rc = new RingCentral('', '', process.env.RINGCENTRAL_SERVER)
  rc.token(token)
  let subs = await rc.get('/restapi/v1.0/subscription')
    .catch(handleError)
  console.log(
    subs, 'subs'
  )
  for (let sub of subs.data.records) {
    await rc.delete(`/restapi/v1.0/subscription/${sub.id}`)
  }
  console.log('delAllSubcribe done')
}

export default async (event) => {
  console.log('event.body', event.body)
  console.log('changes', _.get(event, 'body.body.changes'))
  console.log(
    'shouldSyncVoiceMail:',
    shouldSyncVoiceMail(event)
  )
  let shouldSync = shouldSyncVoiceMail(event)
  if (shouldSync) {
    await syncVocieMail(event)
  }
  return result('WebHook got', 200, {
    headers: {
      'validation-token': event.headers['validation-token']
    }
  })
}
