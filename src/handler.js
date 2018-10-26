global.bot = {}
global.Promise = require('bluebird')

const hub = require('./lib/hub').default

exports.bot = async (event) => {
  console.log('----------event get--------------')
  console.log(event)
  console.log('-----------event get-------------')
  let res = await hub(event)
  console.log('----------res --------------')
  console.log(res)
  console.log('-----------res-------------')
  return res
}
