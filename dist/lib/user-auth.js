/**
 * user auth actions
 */


/**
 * handle subscribe action
 */
const {temp} = require('../../config.default')
const parseJSON = require('../common/json-parse')
const handleError = require('../common/error-handler')
const {syncVocieMail} = require('./message-sync')

const {
  RINGCENTRAL_USER_CLIENT_ID,
  RINGCENTRAL_USER_CLIENT_SECRET,
  RINGCENTRAL_SERVER,
  RINGCENTRAL_BOT_SERVER
} = require('../config.default')
console.log(RINGCENTRAL_USER_CLIENT_ID)
const SDK = require('ringcentral')
//const redirectUri = botServerURI + '/userauth'
const rcsdk = new SDK({
  server: RINGCENTRAL_SERVER,
  appKey: RINGCENTRAL_USER_CLIENT_ID,
  appSecret: RINGCENTRAL_USER_CLIENT_SECRET //,
  //redirectUri
})
const platform = rcsdk.platform()
console.log(temp)
global.bot.platform = platform
/**
 * login with auth code
 * @param {string} code
 */
function login() {
  return platform.login(temp)
    .then(parseJSON)
    .catch(e => {
      console.log(e)
      return e
    })
}

async function delAllSubcribe() {
  let subs = await platform.get('/subscription')
    .then(parseJSON)
    .catch(handleError)
  for (let sub of subs.records) {
    await platform.delete(`/subscription/${sub.id}`)
  }
  console.log('delAllSubcribe done')
}

/**
 * subscribe to glip event
 * @param {string} token
 */
async function subscribeToGlipEvents() {
  await delAllSubcribe()
  let requestData = {
    eventFilters: [
      // Get Glip Post Events
      '/restapi/v1.0/glip/posts',
      // Get Glip Group Events
      '/restapi/v1.0/glip/groups',
      // Get Bot Create/Remove events
      '/restapi/v1.0/account/~/extension/~/message-store'
    ],
    deliveryMode: {
      transportType: 'WebHook',
      address: RINGCENTRAL_BOT_SERVER + '/glip'
    },
    expiresIn: 50000000
  }
  return platform.post('/subscription', requestData)
    .then(parseJSON)
    .catch(function (e) {
      console.error(e)
      return e
    })
}

module.exports = async event => {
  console.log('user auth', event)
  let loginInfo = await login()
  console.log('loginInfo', loginInfo)
  syncVocieMail()
  //global.bot.access_token = loginInfo.access_token
  // let subscribeInfo = await subscribeToGlipEvents(loginInfo)
  // console.log('subscribeInfo', subscribeInfo)
  // if (!subscribeInfo || !subscribeInfo.id) {
  //   return {
  //     statusCode: 500,
  //     message: 'subscribe failed'
  //   }
  // }
  return {
    statusCode: 200,
    message: 'ok'
  }
}
