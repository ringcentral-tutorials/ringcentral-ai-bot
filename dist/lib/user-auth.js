/**
 * user auth actions
 */


/**
 * handle subscribe action
 */
const {botAppConfig} = require('../config.default')
const {
  clientID,
  clientSecret,
  APIServerURL,
  botServerURI
} = botAppConfig
console.log('botAppConfig', botAppConfig)
const SDK = require('ringcentral')
const redirectUri = botServerURI + '/botauth'
const rcsdk = new SDK({
  server: APIServerURL,
  appKey: clientID,
  appSecret: clientSecret,
  redirectUri
})
const platform = rcsdk.platform()
const parseJSON = res => res.json()
/**
 * login with auth code
 * @param {string} code
 */
function login(code) {
  return platform.login({
    code,
    redirectUri
  })
    .then(parseJSON)
    .catch(e => {
      console.log(e)
      return e
    })
}

/**
 * subscribe to glip event
 * @param {string} token
 */
function subscribeToGlipEvents({
  owner_id
}) {
  let requestData = {
    eventFilters: [
      // Get Glip Post Events
      '/restapi/v1.0/glip/posts',
      // Get Glip Group Events
      '/restapi/v1.0/glip/groups',
      // Get Bot Create/Remove events
      //'/restapi/v1.0/account/~/extension/~'
    ],
    deliveryMode: {
      transportType: 'WebHook',
      address: botServerURI + '/glip'
    },
    expiresIn: 50000000
  }
  let authData = rcsdk.platform().auth().data()
  console.log(authData, 'authData')
  rcsdk.platform().post('/subscription', requestData)
    .then(res => {
      console.log(res)
      let r = res.json()
      console.log(r, 'r')
      return r
    })
    .catch(function (e) {
      console.error(e)
      return e
    })
}

module.exports = async event => {
  console.log('bot auth get', event)
  let {code} = event.queryStringParameters || {}
  console.log('bot auth get code', code)
  if (!code) {
    return {
      statusCode: 400,
      message: 'missing required code param'
    }
  }
  let loginInfo = await login(code)
  console.log('loginInfo', loginInfo)
  if (!loginInfo || !loginInfo.access_token) {
    return {
      statusCode: 500,
      message: 'auth failed'
    }
  }
  global.bot.access_token = loginInfo.access_token
  //let subscribeInfo = await subscribeToGlipEvents(loginInfo)
  //console.log('subscribeInfo', subscribeInfo)
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
