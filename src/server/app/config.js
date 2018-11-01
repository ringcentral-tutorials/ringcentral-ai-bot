
import {resolve} from 'path'

const p = resolve(
  process.cwd(),
  'package.json'
)
const pack = require(p)
const {
  PORT = 7867,
  HOST = 'localhost'
} = process.env

export default {
  port: parseInt(PORT),
  host: HOST,
  pack
}
