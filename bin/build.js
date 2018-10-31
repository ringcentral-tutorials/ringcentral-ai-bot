const {exec, cp} = require('shelljs')
const {resolve} = require('path')
const fs = require('fs')
exec('npm run compile')
let pkg = require(
  resolve(__dirname, '../package.json')
)
delete pkg.scripts.postinstall
fs.writeFileSync(
  resolve(__dirname, '../dist/package.json'),
  JSON.stringify(pkg, null, 2)
)
cp('-r', [
  'bin/.yarnclean'
], 'dist/')
exec('cd dist && rm -rf node_modules && npm i --production')
exec('npm run compile-server')
exec('cd dist && yarn generate-lock-entry > yarn.lock && yarn autoclean --force && rm -rf package* && rm -rf .yarnclean && rm -rf yarn.lock')
