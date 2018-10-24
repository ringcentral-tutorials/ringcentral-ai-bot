/**
 * database interface
 */

const fs = require('fs')
const {resolve} = require('path')
const botDbPath = resolve(__dirname, '../data/bot-tokens.json')
const userDbPath = resolve(__dirname, '../data/bot-tokens.json')
const botTokens = require(botDbPath)
const userTokens = require(userDbPath)
const SubX = require('subx')
const store = SubX.create({
  botTokens,
  userTokens
})
SubX.autoRun(store, () => {
  fs.writeFileSync(botDbPath, JSON.stringify(store.botTokens, null, 2))
})
SubX.autoRun(store, () => {
  fs.writeFileSync(userDbPath, JSON.stringify(store.userTokens, null, 2))
})

global.bot.store = store
