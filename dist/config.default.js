
let {env} = process
let config = {}
if (env.NODE_ENV === 'production') {
  config = Object
    .keys(env)
    .reduce((prev, k) => {
      let [k1, k2] = k.split('_')
      if (Object.keys(prev).includes(k1)) {
        prev[k1][k2] = env[k]
      }
      return prev
    }, {
      botAppConfig: {},
      userAppConfig: {}
    })
} else {
  config = require('../config.default')
}
module.exports = config



