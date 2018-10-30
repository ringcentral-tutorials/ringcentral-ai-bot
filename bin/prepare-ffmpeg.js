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
  '../dist/node_modules/@ffmpeg-installer'
)
const toRmove = resolve(
  targetFolder,
  platform
)
const target2 = resolve(
  __dirname,
  '../dist'
)
rm('-rf', toRmove)
exec(`node_modules/.bin/download-npm-package @ffmpeg-installer/linux-x64 ${target2}`)
mv(
  'dist/@ffmpeg-installer/linux-x64',
  resolve(targetFolder, 'inux-x64')
)
rm('-rf', 'dist/@ffmpeg-installer')
const bin = resolve(
  targetFolder,
  'linux-x64/ffmpeg'
)
exec(`chmod +x ${bin}`)


