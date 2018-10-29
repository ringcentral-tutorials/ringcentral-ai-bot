/**
 * user oauth by tyler
 */

import result from './response'
import { getStore } from './store'
import {debug} from './log'
import {subscribeInterval} from '../common/constants'
import _ from 'lodash'
import { shouldSyncVoiceMail } from './message-sync'

export default async (event) => {
  let message = event.body
  //console.log('Message received via user WebHook:', JSON.stringify(message, null, 2))
  let { test, count } = event.queryStringParameters || {}
  if (test) {
    message = {
      body: {
        extensionId: test
      }
    }
  }
  let newMailCount = shouldSyncVoiceMail(event)
  let isRenewEvent = _.get(message, 'body.eventType') === subscribeInterval
  if (test || newMailCount || isRenewEvent) {
    const userId = message.body.extensionId
    const store = await getStore()
    const user = store.getUser(userId)
    if (user && isRenewEvent) {
      debug('receive renew event')
      let id = _.get(
        message,
        'body.subscriptionId'
      )
      debug('receive renew event id', id)
      await user.renewSubscription(id)
      await user.refresh()
    } else if (user) {
      await user.processVoiceMail(newMailCount || count)
    }
  }
  return result('WebHook got', 200, {
    headers: {
      'validation-token': event.headers['validation-token'] || event.headers['Validation-Token']
    }
  })
}
