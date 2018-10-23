import Koa from 'koa'
import mount from 'koa-mount'
import Bodyparser from 'koa-bodyparser'
import logger from 'koa-logger'
import serve from 'koa-static'
import CONFIG from '../config'
import conditional from 'koa-conditional-get'
import etag from 'koa-etag'
import compress from 'koa-compress'
import commonMiddleware from './common-middleware'
import {err} from '../utils/log'
import Router from 'koa-router'
import {bot} from '../../../dist/handler'

const local = CONFIG.testServer
const env = local.env
const cwd = process.cwd()
const app = new Koa()
const staticOption = () => ({
  maxAge: 1000 * 60 * 60 * 24 * 365,
  hidden: true
})

const bodyparser = Bodyparser()

export default function init() {

  // global middlewares
  app.keys = ['sugo:' + env]

  app.use(compress({
    threshold: 2048,
    flush: require('zlib').Z_SYNC_FLUSH
  }))

  //get
  app.use(conditional())

  // add etags
  app.use(etag())

  // //static
  // app.use(async (ctx, next) => {
  //   ctx.set('Cache-Control', 'private, no-cache, no-store, must-revalidate')
  //   ctx.set('Expires', '-1')
  //   ctx.set('Pragma', 'no-cache')
  //   await next()
  // })
  app.use(mount('/_bc', serve(cwd + '/node_modules', staticOption())))

  // body
  app.use(bodyparser)

  if (env === 'development') {
    app.use(logger())
  }

  //global error handle
  app.use(async (ctx, next) => {
    try {
      await next()
    } catch(e) {
      err(e.stack)
      let {path} = ctx
      if (
        /^\/api\//.test(path)
      ) {
        ctx.status = 500
        ctx.body = {
          error: e.message || e.stack,
          serverTime: new Date()
        }
      } else {
        //500 page
        ctx.status = 500
        ctx.body = {
          ...ctx.local,
          stack: e.stack,
          message: e.message
        }
      }
    }
  })

  //common middleware
  app.use(commonMiddleware)

  let router = new Router()
  let handler = async (ctx) => {
    let event = {
      headers: ctx.headers,
      queryStringParameters: ctx.query,
      body: ctx.request.body,
      path: ctx.path,
      pathParameters: ctx.params
    }
    let res = await bot(event)
    if (res.headers) {
      ctx.set(res.headers)
    }
    ctx.status = res.statusCode
    console.log(res, 'res')
    ctx.body = res.message
  }
  router.get('/', handler)
  router.all('/:action', handler)
  app
    .use(router.routes())
    .use(router.allowedMethods())

  return app
}
