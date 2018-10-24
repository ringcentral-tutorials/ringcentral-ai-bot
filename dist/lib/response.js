/**
 * response helper
 */

module.exports = (
  msg,
  status = 200,
  options = {}
) => {
  return {
    statusCode: status,
    message: msg,
    ...options
  }
}
