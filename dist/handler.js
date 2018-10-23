
const hub = require('./lib/hub')

exports.bot = async (event) => {
  return await hub(event)
}

