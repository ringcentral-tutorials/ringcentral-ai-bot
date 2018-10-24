
let {env} = process
let config = Object
  .keys(env)
  .reduce((prev, k) => {
    if (!k.startsWith('RINGCENTRAL')) {
      return prev
    }
    let v = env[k]
    prev[k] = v
    return prev
  }, {})

module.exports = config



