global.bot = {}
global.Promise = require('bluebird')

const hub = require('./lib/hub').default

exports.bot = async (event) => {
  console.log('----------event get--------------')
  console.log(event)
  console.log('-----------event get-------------')
  return await hub(event)
}
