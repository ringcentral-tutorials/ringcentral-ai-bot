const {exec} = require('shelljs')
exec('yarn build')
exec('yarn update-to-aws')
