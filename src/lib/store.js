import SubX from 'subx'
import RingCentral from 'ringcentral-js-concise'
import { debounceTime } from 'rxjs/operators'
import * as R from 'ramda'
import { processMail } from './voicemail-reader'
import { read, write } from './database'
import resultFormatter from './analysis-formatter'
import {log, debug} from './log'
import {subscribeInterval} from '../common/constants'
import _ from 'lodash'

const botEventFilters = [
  '/restapi/v1.0/glip/posts',
  '/restapi/v1.0/glip/groups',
  subscribeInterval
]

const userEventFilters = [
  '/restapi/v1.0/account/~/extension/~/message-store',
  subscribeInterval
]

// Store
const Store = new SubX({
  bots: {},
  users: {},
  caches: {},
  getBot (id) {
    return this.bots[id]
  },
  getUser (id) {
    return this.users[id]
  },
  addBot (bot) {
    this.bots[bot.token.owner_id] = bot
  },
  addUser (user) {
    this.users[user.token.owner_id] = user
  }
})

// Bot
export const Bot = new SubX({
  get rc () {
    const rc = new RingCentral(
      process.env.RINGCENTRAL_BOT_CLIENT_ID,
      process.env.RINGCENTRAL_BOT_CLIENT_SECRET,
      process.env.RINGCENTRAL_SERVER
    )
    rc.token(this.token)
    return rc
  },
  async authorize (code) {
    try {
      await this.rc.authorize({ code, redirectUri: process.env.RINGCENTRAL_BOT_SERVER + '/bot-oauth' })
    } catch (e) {
      log('Bot authorize', e.response.data)
      throw e
    }
    this.token = this.rc.token()
  },
  async setupWebHook () {
    try {
      await this.rc.post('/restapi/v1.0/subscription', {
        eventFilters: botEventFilters,
        deliveryMode: {
          transportType: 'WebHook',
          address: process.env.RINGCENTRAL_BOT_SERVER + '/bot-webhook'
        }
      })
    } catch (e) {
      log('Bot setupWebHook', e.response.data)
      throw e
    }
  },
  async renewWebHooks () {
    try {
      const r = await this.rc.get('/restapi/v1.0/subscription')
      debug('r.data.records bot', r.data.records.length)
      let filtered = r.data.records.filter(
        r => {
          return r.deliveryMode.address === process.env.RINGCENTRAL_BOT_SERVER + '/bot-webhook'
        }
      ).sort((a, b) => {
        return a.expirationTime > b.expirationTime
          ? -1
          : 1
      })
      debug('bot filted', filtered.length)
      for (let i = 0, len = filtered.length;i < len;i ++) {
        let {id} = filtered[i]
        if (
          i === 0
        ) {
          debug('renew bot sub')
          await this.renewSubscription(id)
        } else {
          await this.rc.delete(`/restapi/v1.0/subscription/${id}`)
        }
      }
      if (!filtered.length) {
        debug('setup bot sub')
        await this.setupWebHook()
      }
    } catch (e) {
      log('bot renewWebHooks', e.response.data)
      throw e
    }
  },
  async renewSubscription (id) {
    try {
      return this.rc.post(`/restapi/v1.0/subscription/${id}/renew`)
    } catch (e) {
      log('bot renewSubscription', e.response.data)
      throw e
    }
  },
  async sendMessage (groupId, messageObj) {
    try {
      await this.rc.post(`/restapi/v1.0/glip/groups/${groupId}/posts`, messageObj)
    } catch (e) {
      log('Bot sendMessage', e.response.data)
      throw e
    }
  },
  async validate () {
    try {
      await this.rc.get('/restapi/v1.0/account/~/extension/~')
      return true
    } catch (e) {
      log('Bot validate', e.response.data)
      const errorCode = e.response.data.errorCode
      if (errorCode === 'OAU-232' || errorCode === 'CMN-405') {
        delete store.bots[this.token.owner_id]
        log(`Bot user ${this.token.owner_id} has been deleted`)
        return false
      }
      throw e
    }
  }
})

// User
export const User = new SubX({
  groups: {},
  get rc () {
    const rc = new RingCentral(
      process.env.RINGCENTRAL_USER_CLIENT_ID,
      process.env.RINGCENTRAL_USER_CLIENT_SECRET,
      process.env.RINGCENTRAL_SERVER
    )
    rc.token(this.token)
    return rc
  },
  authorizeUri (groupId, botId) {
    return this.rc.authorizeUri(process.env.RINGCENTRAL_BOT_SERVER + '/user-oauth', {
      state: groupId + ':' + botId,
      responseType: 'code'
    })
  },
  async authorize (code) {
    try {
      await this.rc.authorize({ code, redirectUri: process.env.RINGCENTRAL_BOT_SERVER + '/user-oauth' })
    } catch (e) {
      log('User authorize', e.response.data)
      throw e
    }
    this.token = this.rc.token()
  },
  async refresh () {
    try {
      await this.rc.refresh()
      this.token = this.rc.token()
    } catch(e) {
      log('User try refresh token', e.response.data)
      delete store.users[this.token.owner_id]
      log(`User ${this.token.owner_id} refresh token has expired`)
    }
  },
  async validate () {
    try {
      await this.rc.get('/restapi/v1.0/account/~/extension/~')
      return true
    } catch (e) {
      log('User validate', e.response.data)
      try {
        await this.rc.refresh()
        this.token = this.rc.token()
        return true
      } catch (e) {
        log(
          'User validate refresh',
          e.response
            ? e.response.data
            : e
        )
        delete store.users[this.token.owner_id]
        log(`User ${this.token.owner_id} refresh token has expired`)
        return false
      }
    }
  },
  async renewWebHooks () {
    try {
      const r = await this.rc.get('/restapi/v1.0/subscription')
      log('r.data.records user', r.data.records.length)
      let filtered = r.data.records.filter(
        r => {
          return r.deliveryMode.address === process.env.RINGCENTRAL_BOT_SERVER + '/user-webhook'
        }
      ).sort((a, b) => {
        return a.expirationTime > b.expirationTime
          ? 1
          : -1
      })
      log('user filted', filtered.length)
      for (let i = 0, len = filtered.length;i < len;i ++) {
        let {id} = filtered[i]
        if (
          i === 0
        ) {
          log('do renew user sub')
          await this.renewSubscription(id)
        } else {
          await this.rc.delete(`/restapi/v1.0/subscription/${id}`)
        }
      }
      if (
        !filtered.length && Object.keys(this.groups).length > 0
      ) {
        log('do setup user sub')
        await this.setupWebHook()
      }
    } catch (e) {
      log('user renewWebHooks', e.response.data)
    }
  },
  async renewSubscription (id) {
    try {
      return this.rc.post(`/restapi/v1.0/subscription/${id}/renew`)
    } catch (e) {
      log('user renewSubscription', e.response.data)
    }
  },
  async setupWebHook () { // setup WebHook for voicemail
    try {
      await this.rc.post('/restapi/v1.0/subscription', {
        eventFilters: userEventFilters,
        deliveryMode: {
          transportType: 'WebHook',
          address: process.env.RINGCENTRAL_BOT_SERVER + '/user-webhook'
        }
      })
    } catch (e) {
      log('User setupWebHook', e.response.data)
      throw e
    }
  },
  async addGroup (groupId, botId) {
    const hasNoGroup = Object.keys(this.groups).length === 0
    this.groups[groupId] = botId
    if (hasNoGroup) {
      await this.setupWebHook()
    }
  },
  async getVoiceMails (count) {
    const r = await this.rc.get('/restapi/v1.0/account/~/extension/~/message-store', {
      params: {
        messageType: 'VoiceMail',
        perPage: count
      }
    })
    return r.data.records
  },
  async syncVoiceMails (params = {
    recordCount: 10,
    syncType: 'FSync'
  }) {
    const r = await this.rc.get('/restapi/v1.0/account/~/extension/~/message-sync', {
      params: {
        ...params,
        messageType: 'VoiceMail'
      }
    })
    return r.data.records
  },
  async processVoiceMail (newMailCount = 10) {
    let voiceMails = await this.getVoiceMails(newMailCount)
    let userId = this.token.owner_id
    for (let mail of voiceMails) {
      let msg = await processMail(mail, this.rc)
      await this.sendVoiceMailInfo(
        resultFormatter(userId, msg || {})
      )
    }
  },
  async sendVoiceMailInfo (processedMailInfo = '') {
    for (const groupId of Object.keys(this.groups)) {
      const botId = this.groups[groupId]
      const bot = store.getBot(botId)
      await bot.sendMessage(
        groupId,
        { text: processedMailInfo }
      )
    }
  }
})

// load data from database
let store
export const getStore = async () => {
  if (store) {
    return store
  }
  // load database from S3
  const database = await read()
  store = new Store(database)

  // init bots
  for (const k of R.keys(store.bots)) {
    const bot = new Bot(store.bots[k])
    if (await bot.validate()) {
      store.bots[k] = bot
      await bot.renewWebHooks()
    }
  }

  // init users
  for (const k of R.keys(store.users)) {
    const user = new User(store.users[k])
    if (await user.validate()) {
      store.users[k] = user
      await user.renewWebHooks()
      await user.refresh()
    }
  }

  // auto save to database
  SubX.autoRun(store, async () => {
    await write(store)
  }, debounceTime(1000))

  return store
}

getStore()
