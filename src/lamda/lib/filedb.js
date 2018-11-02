/**
 * filedb lib
 */

import fs from 'fs'
import {resolve} from 'path'
import {tables} from './constants'

const dbPath = resolve(process.cwd(), 'filedb')
const fss = Promise.promisifyAll(fs)

async function prepareDb() {
  let exist = await fss.accessAsync(dbPath)
  if (exist) {
    return true
  }
  await fss.mkdirAsync(dbPath)
  for (let t of tables) {
    await fss.mkdirAsync(`${dbPath}/${t}`)
  }
}

function writeFileAsync(filePath, data) {
  return fss.writeFileAsync(filePath, JSON.stringify(data, null, 2))
}

async function readFileAsync(filePath) {
  let old = await fss.readFileAsync(filePath)
  return JSON.parse(old.toString())
}

/**
 * user action
 * @param {String} tableName, user or bot
 * @param {String} action, add, remove, update, get
 * @param {Object} data
 * for add, {id: xxx, token: {...}, groups: {...}}
 * for remove, {id: xxx} or {ids: [...]}
 * for update, {id: xxx, update: {...}}
 * for get, singleUser:{id: xxx}, allUser: {}
 */
export async function dbAction(tableName, action, data) {
  await prepareDb()
  let {id = '', update, ids} = data
  let filePath = resolve(
    dbPath,
    `${tableName}`,
    `${id}.json`
  )
  switch(action) {
    case 'add':
      await writeFileAsync(filePath, data)
      break
    case 'remove':
      if (id) {
        fss.unlinkAsync(filePath)
      } else if (ids) {
        for (var d of ids) {
          var pd = resolve(
            dbPath,
            `${tableName}`,
            `${d}.json`
          )
          await fss.unlinkAsync(pd)
        }
      }
    case 'update':
      var old = await readFileAsync(filePath)
      Object.assign(old, update)
      await writeFileAsync(filePath, old)
      break
    case 'get':
      if (id) {
        return readFileAsync(filePath)
      } else {
        var dir = resolve(
          dbPath,
          `${tableName}`
        )
        var list = await fss.readdirAsync(dir)
        var res = []
        for (var p of list) {
          var pp = resolve(dir, p)
          var item = await readFileAsync(pp)
          res.push(item)
        }
        return res
      }
  }
}
