/**
 * use google speech api to convert speech2text
 */

const speech = require('@google-cloud/speech')
const fetch = require('node-fetch')
const handleError = require('../common/error-handler')
const _ = require('lodash')
const {resolve} = require('path')
const fs = require('fs')

// Creates a client
const client = new speech.SpeechClient()

const fss = Promise.promisifyAll(fs)
function getVoiceRaw(url, id) {
  return global.bot.platform.get(url)
    .then(res => res.response().buffer())
    .then(b => {
      console.log('buffer get')
      let bb = b.toString('base64')
      return {
        bin: b,
        base64: bb
      }
    })
}

async function speech2text(voiceMailUrl, id, raw) {
  let str = raw
  if (!raw) {
    let {bin, base64} = await getVoiceRaw(voiceMailUrl, id)
    str = base64
    await fss.writeFileAsync(
      resolve(__dirname, `../../${id}.ogg`), bin
    )
  }

  const audio = {
    content: str
  }

  const config = {
    encoding: 'FLAC',
    sampleRateHertz: 16000,
    languageCode: 'en-US'
  }

  const request = {
    config,
    audio: audio
  }
  
  // Detects speech in the audio file
  return client
    .recognize(request)
    .then(data => {
      const response = data[0]
      const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n')
      console.log(response, 'response')
      console.log('Transcription: ', transcription)
      return transcription
    })
    .catch(err => {
      console.error('ERROR:', err)
    })
}

module.exports = {
  speech2text
}
