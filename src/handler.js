global.bot = {}
global.Promise = require('bluebird')

const hub = require('./lib/hub').default

exports.bot = async function (event) {
  let res = await hub(event)
  return res
}
