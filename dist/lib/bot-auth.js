/**
 * handle subscribe action
 */
const {botAppConfig} = require('../config.default')
const {
  clientID,
  clientSecret,
  APIServerURL,
  OAuthRedirectURI
} = require('../config.default').botAppConfig
console.log('botAppConfig', botAppConfig)
const SDK = require('ringcentral')
const rcsdk = new SDK({
  server: APIServerURL,
  appKey: clientID,
  appSecret: clientSecret,
  redirectUri: OAuthRedirectURI
})
const platform = rcsdk.platform()
const parseJSON = res => res.json()
/**
 * login with auth code
 * @param {string} code
 */
function login(code) {
  let url = OAuthRedirectURI + '/botauth'
  return platform.login({
    code,
    redirectUri: url
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
function subscribeToGlipEvents(token){
  let requestData = {
    eventFilters: [
      '/restapi/v1.0/glip/posts',
      '/restapi/v1.0/glip/groups'
    ],
    deliveryMode: {
      transportType: 'WebHook',
      address: OAuthRedirectURI + '/glip'
    },
    expiresIn: 5000000
  }
  platform.post('/subscription', requestData)
    .then(parseJSON)
    .catch(function (e) {
      console.error(e)
      return e
    })
}

module.exports = async event => {
  let {code} = event.queryStringParameters || {}
  if (!code) {
    return {
      statusCode: 400,
      message: 'missing required code param'
    }
  }
  let loginInfo = await login(code)
  console.log('loginInfo', loginInfo)
  if (loginInfo && loginInfo.access_token) {
    let subscribeInfo = await subscribeToGlipEvents(loginInfo.access_token)
    console.log('subscribeInfo', subscribeInfo)
  }


}
