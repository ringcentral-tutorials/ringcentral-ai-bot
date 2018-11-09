/**
 * db interface
 */

import * as dymanodb from './dynamondb'
import * as filedb from './filedb'
import {log} from './common'

const {DB_TYPE} = process.env
if (DB_TYPE !== 'dynamodb') {
  log('use filedb')
} else {
  log('use dynamodb')
}
export default DB_TYPE === 'dynamodb' ? dymanodb : filedb
