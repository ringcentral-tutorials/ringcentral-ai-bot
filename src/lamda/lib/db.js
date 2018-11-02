/**
 * db interface
 */

import * as dymanodb from './dynamondb'
import * as filedb from './file-db'

const {DB_TYPE} = process.env

export default DB_TYPE === 'dynamodb' ? dymanodb : filedb
