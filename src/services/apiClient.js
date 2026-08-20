const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/+$/, '')
const apiBaseUrl = configuredBaseUrl
  ? `${configuredBaseUrl}/api/v1`
  : configuredBaseUrl

if (!apiBaseUrl) {
  throw new Error('VITE_API_BASE_URL is not configured')
}

export function resolveApiAssetUrl(assetUrl) {
  if (!assetUrl) {
    return ''
  }

  try {
    return new URL(assetUrl, `${configuredBaseUrl}/`).toString()
  } catch {
    return assetUrl
  }
}

export class ApiError extends Error {
  constructor(message, { status, payload }) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.payload = payload
  }
}

async function parseResponse(response) {
  if (response.status === 204) {
    return null
  }

  const contentType = response.headers.get('content-type') ?? ''

  if (contentType.includes('application/json')) {
    return response.json()
  }

  const text = await response.text()
  return text || null
}

export async function apiRequest(
  path,
  { method = 'GET', body, headers, signal } = {},
) {
  const requestHeaders = new Headers(headers)
  const isFormData = body instanceof FormData
  let requestBody = body

  if (!requestHeaders.has('Accept')) {
    requestHeaders.set('Accept', 'application/json')
  }

  if (body !== undefined && body !== null && !isFormData) {
    requestHeaders.set('Content-Type', 'application/json')
    requestBody = JSON.stringify(body)
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    method,
    headers: requestHeaders,
    body: requestBody,
    signal,
  })
  const payload = await parseResponse(response)

  if (!response.ok) {
    const message =
      payload?.message ??
      payload?.error ??
      `API request failed with status ${response.status}`

    throw new ApiError(message, {
      status: response.status,
      payload,
    })
  }

  return payload
}
