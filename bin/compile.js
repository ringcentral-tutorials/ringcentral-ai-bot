const {exec, echo, cp, rm} = require('shelljs')
echo('compiling lambda files')
cp('-rf', [
  'src/lambda/*.js'
], 'lambda/')
rm('-rf', 'lambda/lib')
rm('-rf', 'lambda/common')
exec('./node_modules/.bin/babel src/lambda/lib --out-dir lambda/lib')

