global.bot = {}
global.Promise = require('bluebird')

const hub = require('./lib/hub').default

exports.bot = async function (event) {
  console.log('----------event get--------------')
  console.log(event)
  console.log('-----------event get-------------')
  let res = await hub(event)
  console.log('----------res 0--------------')
  console.log(res)
  console.log('-----------res-0s------------')
  return res
}
