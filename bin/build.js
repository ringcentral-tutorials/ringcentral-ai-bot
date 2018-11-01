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
  resolve(__dirname, '../lamda/package.json'),
  JSON.stringify(pkg, null, 2)
)
cp('-r', [
  'bin/.yarnclean'
], 'lamda/')
exec('cd lamda && rm -rf node_modules && npm i --production')
exec('yarn compile-server')
exec('cd lamda && yarn generate-lock-entry > yarn.lock && yarn autoclean --force && rm -rf package* && rm -rf .yarnclean && rm -rf yarn.lock')
echo('build done')
