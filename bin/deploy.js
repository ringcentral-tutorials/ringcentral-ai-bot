const {exec} = require('shelljs')
exec('npm run build')
exec('npm run deploy-to-aws')
