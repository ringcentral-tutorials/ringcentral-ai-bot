const {exec, echo, cp, rm} = require('shelljs')
echo('compile')
cp('-rf', [
  'src/*.js'
], 'dist/')
rm('-rf', 'dist/lib')
rm('-rf', 'dist/common')
exec('./node_modules/.bin/babel src/lib --out-dir dist/lib')
exec('./node_modules/.bin/babel src/common --out-dir dist/common')
