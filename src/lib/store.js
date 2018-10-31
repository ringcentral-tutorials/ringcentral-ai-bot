import SubX from 'subx'
import RingCentral from 'ringcentral-js-concise'
import { debounceTime } from 'rxjs/operators'
import * as R from 'ramda'
import { processMail } from './voicemail-reader'
import { read, write } from './database'
import resultFormatter from './analysis-formatter'
import {log} from './log'
import {subscribeInterval, expiresIn} from '../common/constants'
import _ from 'lodash'

const botEventFilters = () => [
  '/restapi/v1.0/glip/posts',
  '/restapi/v1.0/glip/groups',
  subscribeInterval()
]

const userEventFilters = () => [
  '/restapi/v1.0/account/~/extension/~/message-store',
  subscribeInterval()
]

// Store
const Store = new SubX({
  lastInitTime: 0,
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
    }
    this.token = this.rc.token()
  },
  async setupWebHook () {
    try {
      await this.rc.post('/restapi/v1.0/subscription', {
        eventFilters: botEventFilters(),
        expiresIn: expiresIn(),
        deliveryMode: {
          transportType: 'WebHook',
          address: process.env.RINGCENTRAL_BOT_SERVER + '/bot-webhook'
        }
      })
    } catch (e) {
      let data = _.get(e, 'response.data') || {}
      let str = JSON.stringify(data)
      if (str.includes('SUB-406')) {
        log('bot subscribe fail, will do subscribe one minutes later')
        setTimeout(
          () => this.renewWebHooks(),
          60 * 1000
        )
      } else {
        log('Bot setupWebHook error', e.response.data)
        throw e
      }
    }
  },
  async renewWebHooks () {
    try {
      const r = await this.rc.get('/restapi/v1.0/subscription')
      let filtered = r.data.records.filter(
        r => {
          return r.deliveryMode.address === process.env.RINGCENTRAL_BOT_SERVER + '/bot-webhook'
        }
      )
      log('bot subs list', filtered.map(g => g.id).join(','))
      await this.setupWebHook()
      for (let sub of filtered) {
        await this.delSubscription(sub.id)
      }
    } catch (e) {
      log('bot renewWebHooks error', e.response.data)
    }
  },
  async delSubscription (id) {
    log('del bot sub id:', id)
    try {
      await this.rc.delete(`/restapi/v1.0/subscription/${id}`)
    } catch (e) {
      log('bot delSubscription error', e.response.data)
    }
  },
  async renewSubscription (id) {
    try {
      await this.setupWebHook()
      await this.delSubscription(id)
      log('bot renewed subscribe')
    } catch (e) {
      log('bot renewSubscription error', e.response.data)
    }
  },
  async sendMessage (groupId, messageObj) {
    try {
      await this.rc.post(`/restapi/v1.0/glip/groups/${groupId}/posts`, messageObj)
    } catch (e) {
      log('Bot sendMessage error', e.response.data)
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
      log('User authorize error', e.response.data)
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
      let filtered = r.data.records.filter(
        r => {
          return r.deliveryMode.address === process.env.RINGCENTRAL_BOT_SERVER + '/user-webhook'
        }
      )
      log('user subs list', filtered.map(g => g.id).join(','))
      await this.setupWebHook()
      for (let sub of filtered) {
        await this.delSubscription(sub.id)
      }
    } catch (e) {
      log('user renewWebHooks error', e.response.data)
    }
  },
  async delSubscription (id) {
    log('del user sub id:', id)
    try {
      await this.rc.delete(`/restapi/v1.0/subscription/${id}`)
    } catch (e) {
      log('user delSubscription error', e.response.data)
    }
  },
  async renewSubscription (id) {
    try {
      await this.setupWebHook()
      await this.delSubscription(id)
      log('renewed user subscribe')
    } catch (e) {
      log('user renewSubscription', e.response.data)
    }
  },
  async setupWebHook () { // setup WebHook for voicemail
    try {
      await this.rc.post('/restapi/v1.0/subscription', {
        eventFilters: userEventFilters(),
        expiresIn: expiresIn(),
        deliveryMode: {
          transportType: 'WebHook',
          address: process.env.RINGCENTRAL_BOT_SERVER + '/user-webhook'
        }
      })
    } catch (e) {
      log('User setupWebHook error', e.response.data)
    }
  },
  removeGroup(id) {
    delete this.groups[id]
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

  store.lastInitTime = + new Date()
  // auto save to database
  SubX.autoRun(store, async () => {
    await write(store)
  }, debounceTime(1000))

  return store
}

getStore()
