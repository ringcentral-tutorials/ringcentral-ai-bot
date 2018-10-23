global.bot = {}
global.Promise = require('bluebird')
const hub = require('./lib/hub')

exports.bot = async (event) => {
  return await hub(event)
}

