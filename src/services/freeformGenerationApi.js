import {
  createIntent,
  getUnseen,
  requestUnseen,
  savePreferences,
  selectUnseenCandidate,
} from './customerFlowApi.js'

const POLL_INTERVAL_MS = 750
const MAX_POLL_ATTEMPTS = 120
const generationRequests = new Map()
const silhouetteValues = {
  'backpack-belt-bag': 'Backpack&Belt Bag',
  'mini-bag': 'Mini Bag',
  'shopper-tote': 'Shopper&Tote',
  'shoulder-crossbody': 'Shoulder&Crossbody',
  'top-handle': 'Top Handle',
}

function waitForNextPoll() {
  return new Promise((resolve) => {
    globalThis.setTimeout(resolve, POLL_INTERVAL_MS)
  })
}

function getPreferredCandidate(unseen) {
  const candidates = Array.isArray(unseen?.candidates)
    ? unseen.candidates
    : []

  if (unseen?.selectedCandidateId) {
    return unseen.selectedCandidateId
  }

  const selectedCandidate = candidates.find((candidate) => candidate.selected)

  if (selectedCandidate?.candidateId) {
    return selectedCandidate.candidateId
  }

  const rankedCandidates = [...candidates].sort(
    (first, second) =>
      (first.rank ?? Number.MAX_SAFE_INTEGER) -
      (second.rank ?? Number.MAX_SAFE_INTEGER),
  )

  return rankedCandidates[0]?.candidateId ?? null
}

async function waitForReadyUnseen(sessionId, initialUnseen) {
  let unseen = initialUnseen

  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt += 1) {
    if (unseen?.status === 'READY') {
      return unseen
    }

    if (unseen?.status === 'FAILED') {
      throw new Error(unseen.error || 'UNSEEN 생성에 실패했습니다.')
    }

    await waitForNextPoll()
    unseen = await getUnseen(sessionId)
  }

  throw new Error('UNSEEN 생성 응답 시간이 초과되었습니다.')
}

async function createFreeformGeneration(sessionId, preferences) {
  const savedSession = await savePreferences(sessionId, preferences)
  const generation = await completeGeneration(sessionId)

  return {
    savedSession,
    ...generation,
  }
}

function createChoicePreferences(preferences) {
  const choicePreferences = {
    silhouette: silhouetteValues[preferences.silhouette],
    structure: preferences.structure,
    proportion: preferences.proportion,
    color: preferences.color,
    attitude: preferences.attitude,
    contexts: preferences.contexts,
    lockedAttribute: preferences.lockedAttribute,
  }
  const missingField = Object.entries(choicePreferences).find(
    ([, value]) =>
      (Array.isArray(value) && value.length === 0) ||
      (!Array.isArray(value) &&
        (typeof value !== 'string' || value.trim().length === 0)),
  )

  if (missingField) {
    throw new Error(`${missingField[0]} 선택값을 확인할 수 없습니다.`)
  }

  return choicePreferences
}

async function completeGeneration(sessionId) {
  const intent = await createIntent(sessionId)
  const requestedUnseen = await requestUnseen(sessionId)
  const readyUnseen = await waitForReadyUnseen(sessionId, requestedUnseen)
  const candidateId = getPreferredCandidate(readyUnseen)

  if (!candidateId) {
    throw new Error('선택할 수 있는 UNSEEN 후보가 없습니다.')
  }

  const unseen = await selectUnseenCandidate(sessionId, candidateId)

  return {
    intent,
    unseen,
  }
}

async function createChoiceGeneration(sessionId, preferences) {
  const choicePreferences = createChoicePreferences(preferences)
  const savedSession = await savePreferences(sessionId, choicePreferences)
  const generation = await completeGeneration(sessionId)

  return {
    savedSession,
    ...generation,
  }
}

function runGeneration(requestKey, createRequest) {
  const existingRequest = generationRequests.get(requestKey)

  if (existingRequest) {
    return existingRequest
  }

  const request = createRequest().catch((error) => {
    generationRequests.delete(requestKey)
    throw error
  })

  generationRequests.set(requestKey, request)
  return request
}

export function runFreeformGeneration(sessionId, preferences) {
  return runGeneration(
    `freeform:${sessionId}`,
    () => createFreeformGeneration(sessionId, preferences),
  )
}

export function runChoiceGeneration(sessionId, preferences) {
  return runGeneration(
    `guided:${sessionId}`,
    () => createChoiceGeneration(sessionId, preferences),
  )
}
