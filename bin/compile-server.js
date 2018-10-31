const {exec, echo, cp, rm} = require('shelljs')
echo('compile server')

rm('-rf', 'server')
exec('./node_modules/.bin/babel dev/test-server --out-dir server')
cp('-rf', [
  'dev/test-server/index.js'
], 'server/')
echo('compile server done')

