
const config = require('../config.default')
const ngrok = require('ngrok')

;(async function() {
  let {port} = config.testServer
  let {name} = config.ngrok
  let conf = {
    port,
    subdomain: name || undefined
  }
  const url = await ngrok
    .connect(conf)
    .catch(e => {
      console.log(e)
    })
  console.log(url, '--->', `http://localhost:${port}`)
})()
