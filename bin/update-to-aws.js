
const {exec} = require('shelljs')
exec('cd lamda && ../node_modules/.bin/serverless deploy function -f bot')
