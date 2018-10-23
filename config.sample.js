module.exports = {

  //test server related
  testServer: {
    host: '0.0.0.0',
    port: 7867
  },

  ngrok: {
    // if you have paid ngrok account, you can set your reserved subdomain name here
    name: ''
  },

  // your ringcentral bot app config
  botAppConfig: {
    clientID: '',
    clientSecret: '',
    APIServerURL: '',
    OAuthRedirectURI: ''
  },

  // your ringcentral user app config
  userAppConfig: {
    clientID: '',
    clientSecret: '',
    APIServerURL: '',
    OAuthRedirectURI: ''
  }
}
