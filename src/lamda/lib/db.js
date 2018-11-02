/**
 * db interface
 */

import * as dymanodb from './dynamondb'
import * as filedb from './filedb'

const {DB_TYPE} = process.env

export default DB_TYPE === 'dynamodb' ? dymanodb : filedb
