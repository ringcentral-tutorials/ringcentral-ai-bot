

import RingCentral from 'ringcentral-js-concise'
import handleError from '../common/error-handler'
const {
  RINGCENTRAL_SERVER,
  RINGCENTRAL_BOT_SERVER
} = process.env
import R from 'ramda'

const {store} = global.bot


// remove existing bot WebHooks
const clearBotWebHooks = async token => {
  const rc = new RingCentral('', '', process.env.RINGCENTRAL_SERVER)
  rc.token(token)
  const r = await rc.get('/restapi/v1.0/subscription')
  r.data.records.forEach(async sub => {
    await rc.delete(`/restapi/v1.0/subscription/${sub.id}`)
  })
}

export const setupBotWebHook = async token => {
  try {
    const rc = new RingCentral(
      '',
      '',
      RINGCENTRAL_SERVER
    )
    rc.token(token)
    const res = await rc.post('/restapi/v1.0/subscription', {
      eventFilters: [
        '/restapi/v1.0/glip/posts',
        '/restapi/v1.0/glip/groups'
      ],
      deliveryMode: {
        transportType: 'WebHook',
        address: RINGCENTRAL_BOT_SERVER + '/bot-webhook'
      }
    })
      .catch(handleError)
    //console.log(res.data)
  } catch (e) {
    const data = e.response.data
    if (data.errorCode === 'OAU-232') { // Extension not found
      delete store.botTokens[token.owner_id]
      console.log(`Bot user ${token.owner_id} has been deleted`)
    }
  }
}

R.values(store.botTokens).forEach(async token => {
  await clearBotWebHooks(token)
})

R.values(store.botTokens).forEach(async token => {
  await setupBotWebHook(token)
})
