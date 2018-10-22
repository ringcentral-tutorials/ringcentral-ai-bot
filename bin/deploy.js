const {exec} = require('shelljs')
exec('npm run build')
exec('npm run deloy-to-aws')
