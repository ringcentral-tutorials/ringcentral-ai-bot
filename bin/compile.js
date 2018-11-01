const {exec, echo, cp, rm} = require('shelljs')
echo('compiling lamda files')
cp('-rf', [
  'src/lamda/*.js'
], 'lamda/')
rm('-rf', 'lamda/lib')
rm('-rf', 'lamda/common')
exec('./node_modules/.bin/babel src/lamda/lib --out-dir lamda/lib')
exec('./node_modules/.bin/babel src/lamda/common --out-dir lamda/common')
