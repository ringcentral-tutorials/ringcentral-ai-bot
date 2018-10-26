/**
 * convert voice mail stream to flac format
 * then convert flat buffer to base64 string
 * for google speech to text api
 */

import ffmpeg from 'fluent-ffmpeg'

import handleError from '../common/error-handler'
import { Writable } from 'stream'
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path
ffmpeg.setFfmpegPath(ffmpegPath)

class FakeWrite extends Writable {
  constructor (opts) {
    super(opts)
    this.opts = opts
  }

  _write (data, encoding, done) {
    this.opts.onData(data)
    done()
  }
}

function handleResponse (res) {
  return new Promise((resolve, reject) => {
    let final = new Buffer.alloc(0)
    let writeStream = new FakeWrite({
      onData: data => {
        final = Buffer.concat(
          [final, data]
        )
      }
    })
    writeStream.on('finish', () => {
      resolve(final.toString('base64'))
    })
    writeStream.on('error', (e) => {
      reject(e)
    })
    ffmpeg(res.data)
      .withAudioChannels(1)
      .withAudioFrequency(16000)
      .withAudioQuality(5)
      .withOutputFormat('flac')
      // .on('start', (commandLine) => {
      //   console.log('ffmpeg conversion start: ', commandLine)
      // })
      // .on('progress', function(progress) {
      //   //console.log('Processing: ' + progress.percent + '% done')
      // })
      // .on('stderr', function(stderrLine) {
      //   //console.log('Stderr output: ' + stderrLine)
      //   //reject(stderrLine)
      // })
      // .on('codecData', function(data) {
      //   console.log(data)
      //   //console.log('Input is ' + data.audio + ' audio ' + 'with ' + data.video + ' video')
      //   //final += data.audio.toString('base64')
      // })
      // .on('data', data => {
      //   final += data.toString('base64')
      // })
      // .on('end', () => {
      //   console.log('convert end')
      //   //resolve(final)
      // })
      .on('error', (error) => {
        console.log(error)
        reject(error)
      })
      .pipe(writeStream)
      // .save(
      //   require('path').resolve(__dirname, '../../f.flac')
      // )
  })
}

export async function toFlac (rc, url) {
  return rc.get(url, {
    responseType: 'stream'
  })
    .then(handleResponse)
    .catch(handleError)
}
