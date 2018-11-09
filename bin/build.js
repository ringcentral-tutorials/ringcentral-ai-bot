const {exec, cp, echo} = require('shelljs')
const {resolve} = require('path')
const fs = require('fs')
exec('yarn compile')
echo('building...')
let pkg = require(
  resolve(__dirname, '../package.json')
)
delete pkg.scripts.postinstall
fs.writeFileSync(
  resolve(__dirname, '../lambda/package.json'),
  JSON.stringify(pkg, null, 2)
)
cp('-r', [
  'bin/.yarnclean'
], 'lambda/')
exec('cd lambda && rm -rf node_modules && npm i --production')
exec('yarn compile-server')
exec('cd lambda && yarn generate-lock-entry > yarn.lock && yarn autoclean --force && rm -rf package* && rm -rf .yarnclean && rm -rf yarn.lock')
echo('build done')
