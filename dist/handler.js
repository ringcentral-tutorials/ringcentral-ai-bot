global.bot = {}
global.Promise = require('bluebird')

//init subx store as db
require('./lib/db')

const hub = require('./lib/hub')

exports.bot = async (event) => {
  return await hub(event)
}

