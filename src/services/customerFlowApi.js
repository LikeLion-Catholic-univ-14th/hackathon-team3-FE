import { apiRequest } from './apiClient.js'

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
  { audio, browserTranscript } = {},
  options,
) {
  const body = new FormData()

  if (audio) {
    body.append('audio', audio)
  }

  if (browserTranscript) {
    body.append('browserTranscript', browserTranscript)
  }

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

export function getStores(options) {
  return apiRequest('/stores', options)
}

export function getStoreSlots(storeId, date, options) {
  const query = new URLSearchParams({ date })

  return apiRequest(
    `/stores/${encodeURIComponent(storeId)}/slots?${query.toString()}`,
    options,
  )
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
