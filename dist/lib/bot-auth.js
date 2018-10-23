/**
 * handle subscribe action
 */

const {
  clientID,
  clientSecret,
  APIServerURL,
  OAuthRedirectURI
} = require('../config.default').botAppConfig
const SDK = require('ringcentral')
const rcsdk = new SDK({
  server: APIServerURL,
  appKey: clientID,
  appSecret: clientSecret,
  redirectUri: OAuthRedirectURI
})
const platform = rcsdk.platform()

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
    .then(res => res.json())
    .catch(e => {
      console.log(e)
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
  console.log(loginInfo)
}
