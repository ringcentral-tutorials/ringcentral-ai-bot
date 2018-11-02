/**
 * dynamodb lib
 */

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
  //todo
  console.log(data)
}
