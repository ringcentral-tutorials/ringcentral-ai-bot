/**
 * read voicemail and process it
 */

import _ from 'lodash'
import {store} from './store'
import {log} from './common'
import crypto from 'crypto'

const {
  GOOGLE_APPLICATION_CREDENTIALS
} = process.env

//fake transcript for demo
let speech2text = () => {
  return 'This is fake transcript text result for demo, you could set GOOGLE_APPLICATION_CREDENTIALS in .env to use real google service.'
}

//fake transcript for demo
let textAnalysis = () => {
  return JSON.parse('{"text":"This is fake transcript text result for demo, you could set GOOGLE_APPLICATION_CREDENTIALS in .env to use real google service.","sentiment":{"magnitude":0,"score":0},"syntax":{"sentences":[{"text":{"content":"this is urgent please","beginOffset":-1},"sentiment":null}],"tokens":[{"text":{"content":"this","beginOffset":-1},"partOfSpeech":{"tag":"DET","aspect":"ASPECT_UNKNOWN","case":"CASE_UNKNOWN","form":"FORM_UNKNOWN","gender":"GENDER_UNKNOWN","mood":"MOOD_UNKNOWN","number":"SINGULAR","person":"PERSON_UNKNOWN","proper":"PROPER_UNKNOWN","reciprocity":"RECIPROCITY_UNKNOWN","tense":"TENSE_UNKNOWN","voice":"VOICE_UNKNOWN"},"dependencyEdge":{"headTokenIndex":1,"label":"NSUBJ"},"lemma":"this"},{"text":{"content":"is","beginOffset":-1},"partOfSpeech":{"tag":"VERB","aspect":"ASPECT_UNKNOWN","case":"CASE_UNKNOWN","form":"FORM_UNKNOWN","gender":"GENDER_UNKNOWN","mood":"INDICATIVE","number":"SINGULAR","person":"THIRD","proper":"PROPER_UNKNOWN","reciprocity":"RECIPROCITY_UNKNOWN","tense":"PRESENT","voice":"VOICE_UNKNOWN"},"dependencyEdge":{"headTokenIndex":1,"label":"ROOT"},"lemma":"be"},{"text":{"content":"urgent","beginOffset":-1},"partOfSpeech":{"tag":"ADJ","aspect":"ASPECT_UNKNOWN","case":"CASE_UNKNOWN","form":"FORM_UNKNOWN","gender":"GENDER_UNKNOWN","mood":"MOOD_UNKNOWN","number":"NUMBER_UNKNOWN","person":"PERSON_UNKNOWN","proper":"PROPER_UNKNOWN","reciprocity":"RECIPROCITY_UNKNOWN","tense":"TENSE_UNKNOWN","voice":"VOICE_UNKNOWN"},"dependencyEdge":{"headTokenIndex":1,"label":"ACOMP"},"lemma":"urgent"},{"text":{"content":"please","beginOffset":-1},"partOfSpeech":{"tag":"X","aspect":"ASPECT_UNKNOWN","case":"CASE_UNKNOWN","form":"FORM_UNKNOWN","gender":"GENDER_UNKNOWN","mood":"MOOD_UNKNOWN","number":"NUMBER_UNKNOWN","person":"PERSON_UNKNOWN","proper":"PROPER_UNKNOWN","reciprocity":"RECIPROCITY_UNKNOWN","tense":"TENSE_UNKNOWN","voice":"VOICE_UNKNOWN"},"dependencyEdge":{"headTokenIndex":1,"label":"DISCOURSE"},"lemma":"please"}],"language":"en"},"entitySentiments":[]}')
}

//if set GOOGLE_APPLICATION_CREDENTIALS, use google service
if (GOOGLE_APPLICATION_CREDENTIALS) {
  speech2text = require('audio-analysis-service/dist/url2text').speech2text
  textAnalysis = require('audio-analysis-service/dist/text-analysis').textAnalysis
  log('Using GOOGLE_APPLICATION_CREDENTIALS:', GOOGLE_APPLICATION_CREDENTIALS)
} else {
  log('no GOOGLE_APPLICATION_CREDENTIALS in .env, so use fake data for demo')
}

/**
 * process voice mail
 * @param {object} mail
 * @param {object} rc
 */
export async function processMail (mail, headers) {
  let url = _.get(mail, 'attachments[0].uri')
  if (!url) {
    return ''
  }
  let md5 = crypto.createHash('md5').update(url).digest('hex')
  let cached = await store.getCache(md5)
  if (cached) {
    log('use cache for', url, md5)
    return cached.result
  }
  let text = await speech2text(
    url, headers
  )
  if (!_.isString(text)) {
    return ''
  }
  let result = await textAnalysis(text)
  if (!result || !result.text) {
    return ''
  }
  await store.addCache({
    id: md5,
    result
  })
  return result
}
