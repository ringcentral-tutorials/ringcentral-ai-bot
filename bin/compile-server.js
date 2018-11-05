const {exec, echo, rm} = require('shelljs')
echo('compile server')

rm('-rf', 'server')
exec('./node_modules/.bin/babel src/server --out-dir server')
echo('compile server done')

