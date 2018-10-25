global.bot = {}
global.Promise = require('bluebird')

const hub = require('./lib/hub').default

export const bot = async (event) => {
  return await hub(event)
}
