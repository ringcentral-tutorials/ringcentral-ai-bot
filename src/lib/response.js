/**
 * response helper
 */

export default (
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
