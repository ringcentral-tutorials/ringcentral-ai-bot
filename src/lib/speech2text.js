/**
 * use google speech api to convert speech2text
 */

import speech from '@google-cloud/speech'
import { toFlac } from './voicemail-to-flac'

// Creates a client
const client = new speech.SpeechClient()

export async function speech2text (rc, voiceMailUrl) {
  let str = await toFlac(rc, voiceMailUrl)
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
  let final = await client
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
  return final
}
