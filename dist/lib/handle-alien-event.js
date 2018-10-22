/**
 * handle event not userful
 */

module.exports = () => {
  return {
    statusCode: 500,
    message: 'server can not handle this...'
  }
}
