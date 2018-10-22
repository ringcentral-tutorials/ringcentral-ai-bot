const os = require('os')
const extend = require('recursive-assign')
let config = {

  //dev related
  devCPUCount: os.cpus().length,

  //test server related
  testServer: {
    host: '0.0.0.0',
    port: 7867
  },

  //build options
  minimize: false,

  // aws api url
  url: 'https://xxxxx.execute-api.us-east-1.amazonaws.com/default/poc-rc-ai-bot-dev-hello'

}

try {
  extend(config, require('./config.js'))
} catch (e) {
  if (e.stack.includes('Cannot find module \'./config.js\'')) {
    console.warn('no custom config file, it is ok, but you can use "cp config.sample.js config.js" to create one')
  } else {
    console.log(e)
  }

}

module.exports = config



