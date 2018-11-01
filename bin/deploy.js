const {exec} = require('shelljs')
exec('yarn build')
exec('yarn deploy-to-aws')
