const {cp, exec} = require('shelljs')

cp('package.json', 'dist/')
exec('cd dist && npm i --production && rm -rf package* && cd ..')
