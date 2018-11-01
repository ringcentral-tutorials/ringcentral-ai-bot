/**
 * install ffmpeg linux-x64
 * remove other edition
 */

const os = require('os')
const target = 'linux-x64'
const platform = os.platform() + '-' + os.arch()

//if build in linux x64, exit
if (platform === target) {
  return
}

const {resolve} = require('path')
const {exec, rm, mv} = require('shelljs')
const targetFolder = resolve(
  __dirname,
  '../lamda/node_modules/@ffmpeg-installer'
)
const toRmove = resolve(
  targetFolder,
  platform
)
const target2 = resolve(
  __dirname,
  '../lamda'
)
rm('-rf', toRmove)
exec(`node_modules/.bin/download-npm-package @ffmpeg-installer/linux-x64 ${target2}`)
mv(
  'lamda/@ffmpeg-installer/linux-x64',
  resolve(targetFolder, 'inux-x64')
)
rm('-rf', 'lamda/@ffmpeg-installer')
const bin = resolve(
  targetFolder,
  'linux-x64/ffmpeg'
)
exec(`chmod +x ${bin}`)


