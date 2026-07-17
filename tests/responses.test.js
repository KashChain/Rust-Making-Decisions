import test from 'node:test'
import assert from 'node:assert/strict'
import { validatePayload } from '../api/responses.js'

const now = Date.parse('2026-07-18T12:00:00.000Z')
const startedAt = now - 5000

test('accepts a valid clinic response', () => {
  const result = validatePayload({
    responseType: 'clinic-interest',
    formStartedAt: startedAt,
    website: '',
    name: 'Ada Builder',
    xHandle: '@adabuilder',
    email: 'ada@example.com',
    question: 'How do I verify the owner of a BNS name?',
  }, now)

  assert.equal(result.ok, true)
  assert.deepEqual(result.fields, {
    name: 'Ada Builder',
    xHandle: '@adabuilder',
    email: 'ada@example.com',
    question: 'How do I verify the owner of a BNS name?',
  })
})

test('accepts a valid feedback response', () => {
  const result = validatePayload({
    responseType: 'bns-validation',
    formStartedAt: startedAt,
    website: '',
    ownsBns: 'Not sure',
    biggestQuestion: 'How do renewals work?',
    useChecklist: 'Yes',
    attendClinic: 'Maybe',
  }, now)

  assert.equal(result.ok, true)
  assert.equal(result.fields.attendClinic, 'Maybe')
})

test('silently accepts honeypot submissions without fields', () => {
  const result = validatePayload({
    responseType: 'bns-validation',
    website: 'https://spam.example',
  }, now)

  assert.deepEqual(result, { ok: true, bot: true, responseType: 'bns-validation' })
})

test('rejects submissions completed too quickly', () => {
  const result = validatePayload({
    responseType: 'bns-validation',
    formStartedAt: now - 100,
  }, now)

  assert.equal(result.ok, false)
})

test('rejects unexpected option values', () => {
  const result = validatePayload({
    responseType: 'bns-validation',
    formStartedAt: startedAt,
    ownsBns: 'Sometimes',
    biggestQuestion: 'How do renewals work?',
    useChecklist: 'Yes',
    attendClinic: 'Maybe',
  }, now)

  assert.equal(result.ok, false)
})
