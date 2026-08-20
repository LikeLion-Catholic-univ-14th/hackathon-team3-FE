import { apiRequest } from './apiClient.js'

const storeRequests = new Map()
const storeSlotRequests = new Map()

function sessionPath(sessionId, suffix = '') {
  return `/sessions/${encodeURIComponent(sessionId)}${suffix}`
}

export function createSession(session, options) {
  return apiRequest('/sessions', {
    method: 'POST',
    body: session,
    ...options,
  })
}

export function getSession(sessionId, options) {
  return apiRequest(sessionPath(sessionId), options)
}

export function getPreferenceOptions(options) {
  return apiRequest('/preference-options', options)
}

export function getInputProgress(sessionId, options) {
  return apiRequest(sessionPath(sessionId, '/input-progress'), options)
}

export function saveChoiceInput(sessionId, choice, options) {
  return apiRequest(sessionPath(sessionId, '/inputs/choice'), {
    method: 'POST',
    body: choice,
    ...options,
  })
}

export function saveTextInput(sessionId, input, options) {
  return apiRequest(sessionPath(sessionId, '/inputs/text'), {
    method: 'POST',
    body: input,
    ...options,
  })
}

export function saveVoiceInput(
  sessionId,
  { audio, browserTranscript, language = 'ko' } = {},
  options,
) {
  const body = new FormData()

  if (audio) {
    body.append('audio', audio)
  }

  if (browserTranscript) {
    body.append('browserTranscript', browserTranscript)
  }

  body.append('language', language)

  return apiRequest(sessionPath(sessionId, '/inputs/voice'), {
    method: 'POST',
    body,
    ...options,
  })
}

export function continuePreferences(sessionId, options) {
  return apiRequest(sessionPath(sessionId, '/preferences/continue'), {
    method: 'POST',
    ...options,
  })
}

export function savePreferences(sessionId, preferences, options) {
  return apiRequest(sessionPath(sessionId, '/preferences'), {
    method: 'PUT',
    body: preferences,
    ...options,
  })
}

export function createIntent(sessionId, options) {
  return apiRequest(sessionPath(sessionId, '/intent'), {
    method: 'POST',
    ...options,
  })
}

export function requestUnseen(sessionId, options) {
  return apiRequest(sessionPath(sessionId, '/unseen'), {
    method: 'POST',
    ...options,
  })
}

export function getUnseen(sessionId, options) {
  return apiRequest(sessionPath(sessionId, '/unseen'), options)
}

export function selectUnseenCandidate(sessionId, candidateId, options) {
  return apiRequest(sessionPath(sessionId, '/unseen/selection'), {
    method: 'PATCH',
    body: { candidateId },
    ...options,
  })
}

export function getStores({ city, ...options } = {}) {
  const normalizedCity = city?.trim() ?? ''
  const query = normalizedCity
    ? `?${new URLSearchParams({ city: normalizedCity }).toString()}`
    : ''
  const requestKey = normalizedCity.toLowerCase() || 'all'
  const existingRequest = storeRequests.get(requestKey)

  if (existingRequest) {
    return existingRequest
  }

  const request = apiRequest(`/stores${query}`, options).catch((error) => {
    storeRequests.delete(requestKey)
    throw error
  })

  storeRequests.set(requestKey, request)
  return request
}

export function getStoreSlots(storeId, date, options) {
  const query = new URLSearchParams({ date })
  const requestKey = `${storeId}:${date}`
  const existingRequest = storeSlotRequests.get(requestKey)

  if (existingRequest) {
    return existingRequest
  }

  const request = apiRequest(
    `/stores/${encodeURIComponent(storeId)}/slots?${query.toString()}`,
    options,
  ).finally(() => {
    if (storeSlotRequests.get(requestKey) === request) {
      storeSlotRequests.delete(requestKey)
    }
  })

  storeSlotRequests.set(requestKey, request)
  return request
}

export function createReservation(reservation, options) {
  return apiRequest('/reservations', {
    method: 'POST',
    body: reservation,
    ...options,
  })
}

export function getSessionReservation(sessionId, options) {
  return apiRequest(sessionPath(sessionId, '/reservation'), options)
}
