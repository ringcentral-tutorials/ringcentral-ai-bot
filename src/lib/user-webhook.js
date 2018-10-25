/**
 * user oauth by tyler
 */

import result from './response'
import store from './store'
import {shouldSyncVoiceMail} from './message-sync'

export default async (event) => {
  let message = event.body
  console.log('Message received via user WebHook:', JSON.stringify(message, null, 2))
  let {test, count} = event.queryStringParameters
  if (test) {
    message = {
      body: {
        extensionId: test
      }
    }
  }
  let newMailCount = shouldSyncVoiceMail(event)
  if (test || newMailCount) {
    const userId = message.body.extensionId
    const user = store.getUser(userId)
    if (user) {
      user.processVoiceMail(newMailCount || count)
    }
  }
  return result('WebHook got', 200, {
    headers: {
      'validation-token': event.headers['validation-token']
    }
  })
}
