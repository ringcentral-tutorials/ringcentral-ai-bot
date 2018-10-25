const {cp, exec} = require('shelljs')
exec('npm run compile')
cp('package.json', 'dist/')
exec('cd dist && npm i --production && rm -rf package* && cd ..')
