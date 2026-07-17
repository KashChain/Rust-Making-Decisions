import { put } from '@vercel/blob'

const RESPONSE_TYPES = new Set(['clinic-interest', 'bns-validation'])
const YES_NO_UNSURE = new Set(['Yes', 'No', 'Not sure'])
const YES_MAYBE_NO = new Set(['Yes', 'Maybe', 'No'])
const MAX_BODY_BYTES = 16 * 1024
const MIN_FILL_TIME_MS = 1200

function text(value, maxLength) {
  if (typeof value !== 'string') return ''
  return value.trim().replace(/\r\n/g, '\n').slice(0, maxLength)
}

function isEmail(value) {
  return value === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function isXHandle(value) {
  return /^@?[A-Za-z0-9_]{1,15}$/.test(value)
}

function invalid(message) {
  return { ok: false, error: message }
}

export function validatePayload(payload, now = Date.now()) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return invalid('Invalid request body')
  }

  const responseType = text(payload.responseType, 40)
  if (!RESPONSE_TYPES.has(responseType)) return invalid('Unknown response type')

  // Return success without storing obvious automated submissions.
  if (text(payload.website, 200)) return { ok: true, bot: true, responseType }

  const formStartedAt = Number(payload.formStartedAt)
  if (!Number.isFinite(formStartedAt) || now - formStartedAt < MIN_FILL_TIME_MS) {
    return invalid('Please take a moment to complete the form')
  }

  if (responseType === 'clinic-interest') {
    const name = text(payload.name, 80)
    const xHandle = text(payload.xHandle, 32)
    const email = text(payload.email, 254)
    const question = text(payload.question, 1000)

    if (name.length < 2) return invalid('Name is required')
    if (!isXHandle(xHandle)) return invalid('Enter a valid X handle')
    if (!isEmail(email)) return invalid('Enter a valid email address')
    if (question.length < 5) return invalid('Please include your BNS question')

    return {
      ok: true,
      responseType,
      fields: { name, xHandle, email: email || null, question },
    }
  }

  const ownsBns = text(payload.ownsBns, 20)
  const biggestQuestion = text(payload.biggestQuestion, 1000)
  const useChecklist = text(payload.useChecklist, 20)
  const attendClinic = text(payload.attendClinic, 20)

  if (!YES_NO_UNSURE.has(ownsBns)) return invalid('Select whether you own a BNS name')
  if (biggestQuestion.length < 5) return invalid('Please include your biggest BNS question')
  if (!YES_MAYBE_NO.has(useChecklist)) return invalid('Select whether you would use the checklist')
  if (!YES_MAYBE_NO.has(attendClinic)) return invalid('Select whether you would attend a clinic')

  return {
    ok: true,
    responseType,
    fields: { ownsBns, biggestQuestion, useChecklist, attendClinic },
  }
}

function json(body, status = 200) {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store' },
  })
}

export default {
  async fetch(request) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204 })
    if (request.method !== 'POST') return json({ ok: false, error: 'Method not allowed' }, 405)

    const origin = request.headers.get('origin')
    const host = request.headers.get('host')
    if (origin && host) {
      try {
        if (new URL(origin).host !== host) return json({ ok: false, error: 'Origin not allowed' }, 403)
      } catch {
        return json({ ok: false, error: 'Origin not allowed' }, 403)
      }
    }

    const contentLength = Number(request.headers.get('content-length') || 0)
    if (contentLength > MAX_BODY_BYTES) return json({ ok: false, error: 'Request is too large' }, 413)

    let payload
    try {
      const rawBody = await request.text()
      if (new TextEncoder().encode(rawBody).byteLength > MAX_BODY_BYTES) {
        return json({ ok: false, error: 'Request is too large' }, 413)
      }
      payload = JSON.parse(rawBody)
    } catch {
      return json({ ok: false, error: 'Invalid JSON' }, 400)
    }

    const validation = validatePayload(payload)
    if (!validation.ok) return json({ ok: false, error: validation.error }, 400)
    if (validation.bot) return json({ ok: true }, 201)

    const receivedAt = new Date()
    const id = crypto.randomUUID()
    const datePath = receivedAt.toISOString().slice(0, 10)
    const filename = `${receivedAt.toISOString().replace(/[:.]/g, '-')}-${id}.json`
    const pathname = `responses/${validation.responseType}/${datePath}/${filename}`
    const submittedAt = Number.isFinite(Date.parse(payload.submittedAt))
      ? new Date(payload.submittedAt).toISOString()
      : null

    const record = {
      id,
      responseType: validation.responseType,
      receivedAt: receivedAt.toISOString(),
      submittedAt,
      fields: validation.fields,
    }

    try {
      await put(pathname, JSON.stringify(record, null, 2), {
        access: 'private',
        addRandomSuffix: false,
        contentType: 'application/json',
      })
      return json({ ok: true, id }, 201)
    } catch (error) {
      console.error('Response storage failed', error)
      return json({ ok: false, error: 'Response could not be stored' }, 503)
    }
  },
}
