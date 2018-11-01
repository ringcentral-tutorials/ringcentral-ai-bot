
const env = process.env.NODE_ENV

export function log(...args) {
  console.log(
    '' + new Date().toISOString(),
    ...args
  )
}

export function debug(...args) {
  if (env !== 'production') {
    console.log(
      '' + new Date(),
      ...args
    )
  }
}
