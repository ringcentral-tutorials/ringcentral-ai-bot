global.bot = {}
global.Promise = require('bluebird')

const hub = require('./lib/hub').default

exports.bot = function (event, context, callback) {
  console.log('----------event get--------------')
  console.log(event)
  console.log('-----------event get-------------')
  hub(event)
    .then(callback)
}
