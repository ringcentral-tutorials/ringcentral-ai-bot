/**
 * glip event handler
 */

const {syncVocieMail} = require('./message-sync')
module.exports = async event => {
  console.log('glip event', event, event.headers['validation-token'])
  console.log(event.body.body.changes)
  syncVocieMail(event)
  return {
    statusCode: 200,
    headers: {
      'Validation-Token': event.headers['validation-token']
    },
    message: 'ok'
  }
}
