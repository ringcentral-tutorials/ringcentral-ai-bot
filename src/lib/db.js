/**
 * database interface
 */

import fs from 'fs'
import {resolve} from 'path'
import SubX from 'subx'

const botDbPath = resolve(__dirname, '../data/bot-tokens.json')
const userDbPath = resolve(__dirname, '../data/bot-tokens.json')
const botTokens = require(botDbPath)
const userTokens = require(userDbPath)

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
