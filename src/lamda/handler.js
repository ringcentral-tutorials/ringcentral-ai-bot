global.bot = {}
global.Promise = require('bluebird')

const hub = require('./lib/hub').default

exports.bot = async function (event) {
  return hub(event)
}
