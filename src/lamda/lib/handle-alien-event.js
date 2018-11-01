/**
 * handle event not userful
 */

export default (evt) => {
  return {
    statusCode: 200,
    body: JSON.stringify(evt)
  }
}
