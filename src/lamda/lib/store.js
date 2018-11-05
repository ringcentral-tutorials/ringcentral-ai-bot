
import Subx from 'subx'
import RingCentral from 'ringcentral-js-concise'
import {processMail} from './voicemail-process'
import db from './db'
import {
  log, tables, resultFormatter, debug,
  subscribeInterval, expiresIn, handleRCError
} from './common'
import _ from 'lodash'

const botEventFilters = () => [
  '/restapi/v1.0/glip/posts',
  '/restapi/v1.0/glip/groups'
]

const userEventFilters = () => [
  '/restapi/v1.0/account/~/extension/~/message-store',
  subscribeInterval()
]

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1)
}

//build store functions
function getStore () {
  let subxed = ['user', 'bot']
  return tables.reduce((prev, table) => {
    let cap = capitalizeFirstLetter(table)
    return {
      ...prev,
      [`get${cap}`]: async function(id) {
        let item = {}
        item = await db.dbAction(table, 'get', {id})
        if (!subxed.includes(table)) {
          return item
        }
        if (!item) {
          return item
        }
        return create(item, table)
      },
      [`remove${cap}`]: function(id) {
        return db.dbAction(table, 'remove', {id})
      },
      [`add${cap}`]: function(item) {
        return db.dbAction(table, 'add', item)
      }
    }
  }, {})
}


export const store = getStore()

// Bot
export const Bot = new Subx({
  get rc () {
    const rc = new RingCentral(
      process.env.RINGCENTRAL_BOT_CLIENT_ID,
      process.env.RINGCENTRAL_BOT_CLIENT_SECRET,
      process.env.RINGCENTRAL_SERVER
    )
    rc.token(this.token)
    return rc
  },
  async writeToDb(item) {
    if (item) {
      await db.dbAction('bot', 'add', item)
    } else {
      await db.dbAction('bot', 'update', {
        id: this.id,
        update: {
          token: this.token
        }
      })
    }
  },
  async authorize (code) {
    try {
      await this.rc.authorize({ code, redirectUri: process.env.RINGCENTRAL_BOT_SERVER + '/bot-oauth' })
    } catch (e) {
      handleRCError('Bot authorize', e)
    }
    let token = this.rc.token()
    let id = token.owner_id
    this.token = token
    this.id = id
    await this.writeToDb({
      id,
      token
    })
  },
  async setupWebHook () {
    try {
      await this.rc.post('/restapi/v1.0/subscription', {
        eventFilters: botEventFilters(),
        expiresIn: 500000000,
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
        handleRCError('Bot setupWebHook', e)
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
      debug('bot subs list', filtered.map(g => g.id).join(','))
      await this.setupWebHook()
      for (let sub of filtered) {
        await this.delSubscription(sub.id)
      }
    } catch (e) {
      handleRCError('bot renewWebHooks', e)
    }
  },
  async delSubscription (id) {
    debug('del bot sub id:', id)
    try {
      await this.rc.delete(`/restapi/v1.0/subscription/${id}`)
    } catch (e) {
      handleRCError('bot delSubscription', e)
    }
  },
  async sendMessage (groupId, messageObj) {
    try {
      await this.rc.post(`/restapi/v1.0/glip/groups/${groupId}/posts`, messageObj)
    } catch (e) {
      handleRCError('Bot sendMessage', e)
    }
  },
  async validate () {
    try {
      await this.rc.get('/restapi/v1.0/account/~/extension/~')
      return true
    } catch (e) {
      handleRCError('Bot validate', e)
      const errorCode = _.get(e, 'response.data.errorCode')
      if (errorCode === 'OAU-232' || errorCode === 'CMN-405') {
        await store.removeBot[this.id]
        log(`Bot user ${this.id} has been deleted`)
        return false
      }
    }
  }
})

// User
export const User = new Subx({
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
  async writeToDb(item) {
    if (item) {
      await db.dbAction('user', 'add', item)
    } else {
      await db.dbAction('user', 'update', {
        id: this.id,
        update: {
          token: this.token,
          groups: this.groups
        }
      })
    }
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
      handleRCError('User authorize', e)
    }
    let token = this.rc.token()
    let id = token.owner_id
    this.token = token
    this.id = id
    await this.writeToDb({
      id,
      token,
      groups: {}
    })
  },
  async refresh () {
    try {
      await this.rc.refresh()
      this.token = this.rc.token()
    } catch(e) {
      handleRCError('User refresh token', e)
      await store.removeUser(this.id)
      log(`User ${this.token.owner_id} refresh token has expired`)
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
      handleRCError('user renewWebHooks', e)
    }
  },
  async delSubscription (id) {
    try {
      await this.rc.delete(`/restapi/v1.0/subscription/${id}`)
    } catch (e) {
      handleRCError(`user delSubscription ${id}`, e)
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
      handleRCError('User setupWebHook', e)
    }
  },
  async removeGroup(id) {
    delete this.groups[id]
    await this.writeToDb()
  },
  async addGroup (groupId, botId) {
    const hasNoGroup = Object.keys(this.groups).length === 0
    this.groups[groupId] = botId
    await this.writeToDb()
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
  /*
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
  */
  async processVoiceMail (newMailCount = 10) {
    if (!Object.keys(this.groups)) {
      return
    }
    let voiceMails = await this.getVoiceMails(newMailCount)
    let userId = this.id
    let headers = this.rc._bearerAuthorizationHeader()
    for (let mail of voiceMails) {
      let msg = await processMail(mail, headers)
      await this.sendVoiceMailInfo(
        resultFormatter(userId, msg || {})
      )
    }
  },
  async sendVoiceMailInfo (processedMailInfo = '') {
    for (const groupId of Object.keys(this.groups)) {
      const botId = this.groups[groupId]
      const bot = await store.getBot(botId)
      await bot.sendMessage(
        groupId,
        { text: processedMailInfo }
      )
    }
  }
})

/**
 * create instance from user/bot info
 * @param {object} item
 * @param {*} type 
 */
async function create(item, type) {
  let dict = {
    bot: Bot,
    user: User
  }
  let inst = new dict[type](item)
  return inst
}
