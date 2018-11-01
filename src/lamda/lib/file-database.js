import fs from 'fs'
import {resolve} from 'path'
import {log} from './log'

const Bucket = process.env.AWS_S3_BUCKET
const dbPath = resolve(
  process.cwd(),
  'database.json'
)
if (!Bucket) {
  log('No s3 Bucket, use file based database')
  try {
    fs.accessSync(dbPath)
  } catch(e) {
    log('no database.json, will create one for you')
    fs.writeFileSync(dbPath, '{}')
  }
}

export const read = () => new Promise((resolve, reject) => {
  fs.readFile(dbPath, (err, buf) => {
    if (err) {
      return reject(err)
    }
    resolve(JSON.parse(buf.toString()))
  })
})

export const write = json => new Promise((resolve, reject) => {
  fs.writeFile(dbPath, JSON.stringify(json, null, 2), (err) => {
    if (err) {
      return reject(err)
    }
    resolve()
  })
})
