/**
 * check event type, send event to different event handler
 */

const {subscribe, isSubscribe} = require('./subscribe')
const {userauth, isUserauth} = require('./user-auth')
const {handleVoicemail, isVoicemail} = require('./voice-mail-reader')
const handleAlienEvent = require('./handle-alien-event')

module.exports = event => {
  if (
    isSubscribe(event)
  ) {
    return subscribe(event)
  } else if (
    isUserauth(event)
  ) {
    return userauth(event)
  } else if (
    isVoicemail(event)
  ) {
    return handleVoicemail(event)
  } else {
    return handleAlienEvent(event)
  }
}
