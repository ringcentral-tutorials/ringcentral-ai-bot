import fs from 'fs'
import R from 'ramda'
import dotenv from 'dotenv'
import express from 'express'
import bodyParser from 'body-parser'
import RingCentral from 'ringcentral-js-concise'
import SubX from 'subx'
import path from 'path'

import botTokens from '../fakeDb/bot-tokens.json'
import userTokens from '../fakeDb/user-tokens.json'

dotenv.config()

// Use SubX to auto save tokens
const store = SubX.create({
  botTokens,
  userTokens
})
SubX.autoRun(store, () => {
  fs.writeFileSync(path.join(__dirname, '../fakeDb/bot-tokens.json'), JSON.stringify(store.botTokens, null, 2))
})
SubX.autoRun(store, () => {
  fs.writeFileSync(path.join(__dirname, '../fakeDb/user-tokens.json'), JSON.stringify(store.userTokens, null, 2))
})

// remove existing bot WebHooks
const clearBotWebHooks = async token => {
  const rc = new RingCentral('', '', process.env.RINGCENTRAL_SERVER)
  rc.token(token)
  const r = await rc.get('/restapi/v1.0/subscription')
  r.data.records.forEach(async sub => {
    await rc.delete(`/restapi/v1.0/subscription/${sub.id}`)
  })
}
R.values(store.botTokens).forEach(async token => {
  await clearBotWebHooks(token)
})

const setupBotWebHook = async token => {
  try {
    const rc = new RingCentral('', '', process.env.RINGCENTRAL_SERVER)
    rc.token(token)
    const res = await rc.post('/restapi/v1.0/subscription', {
      eventFilters: [
        '/restapi/v1.0/glip/posts',
        '/restapi/v1.0/glip/groups'
      ],
      deliveryMode: {
        transportType: 'WebHook',
        address: process.env.RINGCENTRAL_BOT_SERVER + '/bot-webhook'
      }
    })
    console.log(res.data)
  } catch (e) {
    const data = e.response.data
    if (data.errorCode === 'OAU-232') { // Extension not found
      delete store.botTokens[token.owner_id]
      console.log(`Bot user ${token.owner_id} has been deleted`)
    }
  }
}
R.values(store.botTokens).forEach(async token => {
  await setupBotWebHook(token)
})

const app = express()
app.use(bodyParser.json())

// add bot to Glip
app.get('/bot-oauth', async (req, res) => {
  const rc = new RingCentral(process.env.RINGCENTRAL_BOT_CLIENT_ID, process.env.RINGCENTRAL_BOT_CLIENT_SECRET, process.env.RINGCENTRAL_SERVER)
  const code = req.query.code
  try {
    await rc.authorize({ code, redirectUri: process.env.RINGCENTRAL_BOT_SERVER + '/bot-oauth' })
  } catch (e) {
    console.log(JSON.stringify(e.response.data, null, 2))
  }
  const token = rc.token()
  console.log(token)
  store.botTokens[token.owner_id] = token

  await setupBotWebHook(token)

  res.send('Bot added')
})

app.get('/user-oauth', async (req, res) => {
  const userRc = new RingCentral(process.env.RINGCENTRAL_USER_CLIENT_ID, process.env.RINGCENTRAL_USER_CLIENT_SECRET, process.env.RINGCENTRAL_SERVER)
  const code = req.query.code
  const [groupId, botId] = req.query.state.split(':')
  console.log(`User tried to authorize from Glip group ${groupId} for bot ${botId}`)
  try {
    await userRc.authorize({ code, redirectUri: process.env.RINGCENTRAL_BOT_SERVER + '/user-oauth' })
  } catch (e) {
    console.log(JSON.stringify(e.response.data, null, 2))
  }
  const token = userRc.token()
  console.log(token)
  store.userTokens[token.owner_id] = token

  // todo: setup user voicemail webhook

  const botRc = new RingCentral('', '', process.env.RINGCENTRAL_SERVER)
  botRc.token(store.botTokens[botId])
  await botRc.post(`/restapi/v1.0/glip/groups/${groupId}/posts`, {
    text: 'You have successfully authorized me to access your RingCentral data!'
  })
  res.send('You have authorized the bot to access your RingCentral data! Please close this page and get back to Glip')
})

// bot receive message from Glip
app.post('/bot-webhook', async (req, res) => {
  const message = req.body
  console.log('Message received via bot WebHook:', message)
  const botId = message.ownerId
  const body = message.body
  if (body) {
    switch (body.eventType) {
      case 'GroupJoined':
        if (body.type === 'PrivateChat') {
          const botToken = store.botTokens[botId]
          const botRc = new RingCentral('', '', process.env.RINGCENTRAL_SERVER)
          botRc.token(botToken)
          await botRc.post(`/restapi/v1.0/glip/groups/${body.groupId}/posts`, {
            text: 'Hello, you just started a new conversation with the bot!'
          })
          const userToken = store.userTokens[body.creatorId]
          if (!userToken) {
            const userRc = new RingCentral(process.env.RINGCENTRAL_USER_CLIENT_ID, '', process.env.RINGCENTRAL_SERVER)
            const authorizeUri = userRc.authorizeUri(process.env.RINGCENTRAL_BOT_SERVER + '/user-oauth', {
              state: body.groupId + ':' + botId,
              responseType: 'code'
            })
            await botRc.post(`/restapi/v1.0/glip/groups/${body.groupId}/posts`, {
              text: `Please [click here](${authorizeUri}) to authorize me to access your RingCentral data`
            })
          }
        }
        break
      case 'PostAdded':
        if (body.creatorId !== botId) { // Bot should not respond to himself
          const botToken = store.botTokens[botId]
          const botRc = new RingCentral('', '', process.env.RINGCENTRAL_SERVER)
          botRc.token(botToken)
          const userToken = store.userTokens[body.creatorId]
          if (userToken) {
            await botRc.post(`/restapi/v1.0/glip/groups/${body.groupId}/posts`, {
              text: 'Got it!'
            })
          } else {
            const userRc = new RingCentral(process.env.RINGCENTRAL_USER_CLIENT_ID, '', process.env.RINGCENTRAL_SERVER)
            const authorizeUri = userRc.authorizeUri(process.env.RINGCENTRAL_BOT_SERVER + '/user-oauth', {
              state: body.groupId + ':' + botId,
              responseType: 'code'
            })
            await botRc.post(`/restapi/v1.0/glip/groups/${body.groupId}/posts`, {
              text: `Please [click here](${authorizeUri}) to authorize me to access your RingCentral data`
            })
          }
        }
        break
      default:
        break
    }
  }
  res.header('validation-token', req.header('validation-token'))
  res.send('WebHook replied')
})

app.listen(3000)
