global.bot = {}
global.Promise = require('bluebird')

const hub = require('./lib/hub').default

exports.bot = async (event) => {
  return await hub(event)
}
