

//user bluebird as global.Promise for better performance

import init from './app-init'
import config from './config'
import {log} from '../../lamda/lib/log'
import http from 'http'

const start = async function () {
  let { port, host, pack } = config
  let app = await init()
  let server = http.Server(app.callback())
  server.listen(port, host, () => {
    log(`${pack.name} server start on --> http://${host}:${port}`)
  })
}

try {
  start()
} catch (e) {
  log(`error start ${config.pack.name}'`, e.stack)
  process.exit(1)
}
