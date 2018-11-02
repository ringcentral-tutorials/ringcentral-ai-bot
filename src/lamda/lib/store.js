import SubX from 'subx'
import RingCentral from 'ringcentral-js-concise'
import { processMail } from './voicemail-reader'
import {dbAction} from './db'
import resultFormatter from './analysis-formatter'
import {log} from './log'
import {subscribeInterval, expiresIn} from '../common/constants'
import _ from 'lodash'
import {tables} from './constants'
import { create } from 'domain';

const botEventFilters = () => [
  '/restapi/v1.0/glip/posts',
  '/restapi/v1.0/glip/groups',
  subscribeInterval()
]

const userEventFilters = () => [
  '/restapi/v1.0/account/~/extension/~/message-store',
  subscribeInterval()
]

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

// Bot
class Bot {
  constructor(props) {
    Object.assign(this, props)
  }
  async writeToDb() {
    await dbAction('bot', 'update', {
      id: this.id,
      update: {
        token: this.token,
        groups: this.groups
      }
    })
  }
  get rc () {
    const rc = new RingCentral(
      process.env.RINGCENTRAL_BOT_CLIENT_ID,
      process.env.RINGCENTRAL_BOT_CLIENT_SECRET,
      process.env.RINGCENTRAL_SERVER
    )
    rc.token(this.token)
    return rc
  }
  async authorize (code) {
    try {
      await this.rc.authorize({ code, redirectUri: process.env.RINGCENTRAL_BOT_SERVER + '/bot-oauth' })
    } catch (e) {
      log('Bot authorize', e.response.data)
    }
    this.token = this.rc.token()
    await this.writeToDb()
  }
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
  }
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
  }
  async delSubscription (id) {
    log('del bot sub id:', id)
    try {
      await this.rc.delete(`/restapi/v1.0/subscription/${id}`)
    } catch (e) {
      log('bot delSubscription error', e.response.data)
    }
  }
  async renewSubscription (id) {
    try {
      await this.setupWebHook()
      await this.delSubscription(id)
      log('bot renewed subscribe')
    } catch (e) {
      log('bot renewSubscription error', e.response.data)
    }
  }
  async sendMessage (groupId, messageObj) {
    try {
      await this.rc.post(`/restapi/v1.0/glip/groups/${groupId}/posts`, messageObj)
    } catch (e) {
      log('Bot sendMessage error', e.response.data)
    }
  }
  async validate () {
    try {
      await this.rc.get('/restapi/v1.0/account/~/extension/~')
      return true
    } catch (e) {
      log('Bot validate', e.response.data)
      const errorCode = e.response.data.errorCode
      if (errorCode === 'OAU-232' || errorCode === 'CMN-405') {
        await store.removeBot[this.id]
        log(`Bot user ${this.token.owner_id} has been deleted`)
        return false
      }
    }
  }
}

// User
class User {
  constructor(props) {
    Object.assign(this, props)
  }
  groups = {}
  get rc () {
    const rc = new RingCentral(
      process.env.RINGCENTRAL_USER_CLIENT_ID,
      process.env.RINGCENTRAL_USER_CLIENT_SECRET,
      process.env.RINGCENTRAL_SERVER
    )
    rc.token(this.token)
    return rc
  }
  authorizeUri (groupId, botId) {
    return this.rc.authorizeUri(process.env.RINGCENTRAL_BOT_SERVER + '/user-oauth', {
      state: groupId + ':' + botId,
      responseType: 'code'
    })
  }
  async authorize (code) {
    try {
      await this.rc.authorize({ code, redirectUri: process.env.RINGCENTRAL_BOT_SERVER + '/user-oauth' })
    } catch (e) {
      log('User authorize error', e.response.data)
    }
    this.token = this.rc.token()
  }
  async refresh () {
    try {
      await this.rc.refresh()
      this.token = this.rc.token()
    } catch(e) {
      log('User try refresh token', e.response.data)
      await store.removeUser(this.id)
      log(`User ${this.token.owner_id} refresh token has expired`)
    }
  }
  async validate () {
    try {
      await this.rc.get('/restapi/v1.0/account/~/extension/~')
      return true
    } catch (e) {
      log('User validate', e.response.data)
      try {
        await this.rc.refresh()
        this.token = this.rc.token()
        await this.writeToDb()
        return true
      } catch (e) {
        log(
          'User validate refresh error',
          e.response
            ? e.response.data
            : e
        )
        await store.removeUser(this.id)
        log(`User ${this.token.owner_id} refresh token has expired`)
        return false
      }
    }
  }
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
  }
  async delSubscription (id) {
    log('del user sub id:', id)
    try {
      await this.rc.delete(`/restapi/v1.0/subscription/${id}`)
    } catch (e) {
      log('user delSubscription error', e.response.data)
    }
  }
  async renewSubscription (id) {
    try {
      await this.setupWebHook()
      await this.delSubscription(id)
      log('renewed user subscribe')
    } catch (e) {
      log('user renewSubscription', e.response.data)
    }
  }
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
  }
  async removeGroup(id) {
    delete this.groups[id]
    await this.writeToDb()
  }
  async addGroup (groupId, botId) {
    const hasNoGroup = Object.keys(this.groups).length === 0
    this.groups[groupId] = botId
    await this.writeToDb()
    if (hasNoGroup) {
      await this.setupWebHook()
    }
  }
  async getVoiceMails (count) {
    const r = await this.rc.get('/restapi/v1.0/account/~/extension/~/message-store', {
      params: {
        messageType: 'VoiceMail',
        perPage: count
      }
    })
    return r.data.records
  }
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
  }
  async processVoiceMail (newMailCount = 10) {
    if (!Object.keys(this.groups)) {
      return
    }
    let voiceMails = await this.getVoiceMails(newMailCount)
    let userId = this.token.owner_id
    for (let mail of voiceMails) {
      let msg = await processMail(mail, this.rc)
      await this.sendVoiceMailInfo(
        resultFormatter(userId, msg || {})
      )
    }
  }
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
}

async function create(item, type) {
  let dict = {
    bot: Bot,
    user: User
  }
  let inst = new dict[type](item)
  await inst.writeToDb()
  return inst
}

// load data from database
export const getStore = async () => {
  let subxed = ['user', 'bot']
  return tables.reduce((prev, table) => {
    let cap = capitalizeFirstLetter(table)
    return {
      ...prev,
      [`get${cap}`]: async function(id) {
        let item = await dbAction(table, 'get', {id})
        if (!subxed.includes(table)) {
          return item
        }
        return create(item, table)
      },
      [`remove${cap}`]: async function(id) {
        let item = await dbAction(table, 'remove', {id})
      },
      [`add${cap}`]: async function(item) {
        await dbAction(table, 'add', {id})
      }
    }
  }, {})
}

export const store = getStore()
