const {exec} = require('shelljs')
exec('cd lambda && ../node_modules/.bin/serverless deploy -v')
