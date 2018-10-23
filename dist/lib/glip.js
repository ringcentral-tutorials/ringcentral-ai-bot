/**
 * glip event handler
 */

module.exports = async event => {
  console.log('glip event', event, event.headers['validation-token'])
  return {
    statusCode: 200,
    headers: {
      'Validation-Token': event.headers['validation-token']
    },
    message: 'ok'
  }
}
