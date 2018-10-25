global.bot = {}
global.Promise = require('bluebird')

//init subx store as db
require('./lib/db')
require('./config.default')

const hub = require('./lib/hub').default

export const bot = async (event) => {
  return await hub(event)
}

