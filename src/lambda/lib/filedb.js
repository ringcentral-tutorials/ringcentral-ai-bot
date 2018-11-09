/**
 * filedb lib
 */

import fs from 'fs'
import {resolve} from 'path'
import {tables, debug} from './common'

const dbPath = resolve(process.cwd(), 'filedb')
const fss = Promise.promisifyAll(fs)

function accessAsync(path) {
  return new Promise((resolve) => {
    fs.access(path, (err) => {
      if (err) {
        return resolve(false)
      }
      resolve(true)
    })
  })
}

async function prepareDb() {
  let exist = await accessAsync(dbPath)
  if (exist) {
    return true
  }
  await fss.mkdirAsync(dbPath)
  for (let t of tables) {
    await fss.mkdirAsync(`${dbPath}/${t}`)
  }
}

function writeFileAsync(filePath, data) {
  return fss
    .writeFileAsync(filePath, JSON.stringify(data, null, 2))
    .catch(() => false)
}

function readFileAsync(filePath) {
  return fss.readFileAsync(filePath)
    .then(r => JSON.parse(r.toString()))
    .catch(() => false)
}

/**
 * db action
 * @param {String} tableName, user or bot
 * @param {String} action, add, remove, update, get
 * @param {Object} data
 * for add, {id: xxx, token: {...}, groups: {...}}
 * for remove, {id: xxx} or {ids: [...]}
 * for update, {id: xxx, update: {...}}
 * for get, singleUser:{id: xxx}, allUser: {}
 */
export async function dbAction(tableName, action, data) {
  debug(
    'db',
    tableName,
    action,
    data
  )
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
      if (!id) {
        return
      }
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
      break
    case 'update':
      if (!id) {
        return
      }
      var old = await readFileAsync(filePath)
      if (old) {
        Object.assign(old, update)
        await writeFileAsync(filePath, old)
      }
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
    default:
      break
  }
}
