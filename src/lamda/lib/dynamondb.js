/**
 * dynamodb lib
 */

import AWS from 'aws-sdk'
import _ from 'lodash'
import {
  tables,
  debug,
  dynamodbDefinitions
} from './common'

AWS.config.update({
  region: process.env.DYNAMODB_REGION
})

const prefix = process.env.DYNAMODB_TABLE_PREFIX || 'ringcental_ai_bot'

const dynamodb = new AWS.DynamoDB()

function createTableName(table) {
  return prefix + '_' + table
}
function tableExist() {
  return new Promise((resolve) => {
    let params = {
      TableName: createTableName(tables[0])
    }
    dynamodb.describeTable(params, function (err) {
      if (err) {
        resolve(false)
      }
      resolve(true)
    })
  })
}

function createTable(table) {
  return new Promise((resolve, reject) => {
    let defs = dynamodbDefinitions[table]
    let params = Object.keys(defs).reduce(
      (prev, key) => {
        let v = defs[key]
        prev.AttributeDefinitions.push({
          AttributeName: key,
          AttributeType: v[0]
        })
        prev.KeySchema.push({
          AttributeName: key,
          KeyType: v[1]
        })
        return prev
      },
      {
        AttributeDefinitions: [],
        KeySchema: [],
        TableName: createTableName(table),
        ProvisionedThroughput: {
          ReadCapacityUnits: 5,
          WriteCapacityUnits: 5
        }
      }
    )
    dynamodb.createTable(params, function(err, data) {
      if (err) {
        debug(err, 'create table error')
        reject(err)
      } else {
        resolve(data)
      }
    })
  })
}

async function prepareDb() {
  let exist = await tableExist()
  if (exist) {
    return true
  }
  for (let t of tables) {
    await createTable(t)
  }
}

function putItem(item, table) {
  return new Promise((resolve, reject) => {
    let Item = Object.keys(item).reduce(
      (prev, key) => {
        let type = _.get(
          dynamodbDefinitions,
          `${table}.${key}[2]`
        )
        let v = item[key]
        return {
          ...prev,
          [key]: {
            S: type === 'string'
              ? v
              : JSON.stringify(v)
          }
        }
      },
      {}
    )
    let params = {
      TableName: createTableName(table),
      Item
    }
    dynamodb.putItem(params, function (err) {
      if (err) {
        debug('put item error', err.stack)
        return reject(err)
      }
      resolve(true)
    })
  })
}

function removeItem(id, table) {
  return new Promise((resolve) => {
    let params = {
      TableName: createTableName(table),
      Key: {
        id: {
          S: id
        }
      }
    }
    dynamodb.deleteItem(params, function (err) {
      if (err) {
        debug(err, 'delete item error')
        return resolve(false)
      }
      resolve(true)
    })
  })
}

function getItem(id, table) {
  return new Promise((resolve) => {
    let params = {
      TableName: createTableName(table),
      Key: {
        id: {
          S: id
        }
      }
    }
    dynamodb.getItem(params, function (err, data) {
      if (err) {
        debug(err, 'get item error')
        return resolve(false)
      }
      /*
      data = {
        Item: {
        "AlbumTitle": {
          S: "Songs About Life"
          },
        "Artist": {
          S: "Acme Band"
          },
        "SongTitle": {
          S: "Happy Day"
          }
        }
      }
      */
      if (!data.Item) {
        return resolve(false)
      }
      let res = Object.keys(data.Item)
        .reduce((prev, key) => {
          let type = _.get(
            dynamodbDefinitions,
            `${table}.${key}[1]`
          )
          let v = _.get(data, `Item.${key}.S`)
          if (!type) {
            v = JSON.parse(v)
          }
          return {
            ...prev,
            [key]: v
          }
        }, {})
      resolve(res)
    })
  })
}

/**
 * user action
 * @param {String} tableName
 * @param {String} action, add, remove, update, get
 * @param {Object} data
 * for add, {id: xxx, token: {...}, groups: {...}}
 * for remove, {id: xxx} or {ids: [...]}
 * for update, {id: xxx, update: {...}}
 * for get, singleUser:{id: xxx}, allUser: undefined
 */
export async function dbAction(tableName, action, data) {
  debug(
    'db',
    tableName,
    action,
    data
  )
  await prepareDb()
  let {id = '', update} = data
  switch(action) {
    case 'add':
      await putItem(data, tableName)
      break
    case 'remove':
      if (!id) {
        return
      }
      if (id) {
        removeItem(id, tableName)
      }
      break
    case 'update':
      if (!id) {
        return
      }
      var old = await getItem(id, tableName)
      if (old) {
        Object.assign(old, update)
        await putItem(old, tableName)
      }
      break
    case 'get':
      if (id) {
        return getItem(id, tableName)
      }
      break
    default:
      break
  }
}
