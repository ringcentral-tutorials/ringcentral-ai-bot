/**
 * user oauth by tyler
 */

import result from './response'
import store from './store'
import {shouldSyncVoiceMail} from './message-sync'

export default async (event) => {
  let message = event.body
  console.log('Message received via user WebHook:', JSON.stringify(message, null, 2))
  let {test} = event.queryStringParameters
  if (test) {
    message = {
      body: {
        extensionId: test
      }
    }
  }
  if (test || shouldSyncVoiceMail(event)) {
    const userId = message.body.extensionId
    console.log(userId, 'userId')
    const user = store.getUser(userId)
    console.log(user, 'user')
    if (user) {
      user.processVoiceMail()
    }
  }
  return result('WebHook got', 200, {
    headers: {
      'validation-token': event.headers['validation-token']
    }
  })
}
