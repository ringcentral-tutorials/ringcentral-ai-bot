/**
 * user oauth by tyler
 */

import {result, subscribeInterval, shouldSyncVoiceMail} from './common'
import {store} from './store'
import _ from 'lodash'

export default async (event) => {
  let message = event.body
  let { test, count } = event.queryStringParameters || {}
  if (test) {
    message = {
      body: {
        extensionId: test
      }
    }
  }
  let newMailCount = shouldSyncVoiceMail(event)
  let isRenewEvent = _.get(message, 'event') === subscribeInterval()
  if (newMailCount || isRenewEvent) {
    const userId = message.body.extensionId || message.ownerId
    const user = await store.getUser(userId)
    if (user && isRenewEvent) {
      // let id = _.get(
      //   message,
      //   'subscriptionId'
      // )
      await user.renewWebHooks()
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
