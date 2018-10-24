const extend = require('recursive-assign')
let config = {

  //test server related
  testServer: {
    host: '0.0.0.0',
    port: 7867
  },

  ngrok: {
    name: ''
  }

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



