import crypto from 'crypto'
import { config } from '../../config.js'

const ALGO = 'aes-256-gcm'
const IV_LEN = 16
const TAG_LEN = 16

const deriveKey = (agencyId) =>
  crypto.createHash('sha256')
    .update(`${config.jwtSecret}:gds:${agencyId}`)
    .digest()

/** Encrypt credentials object for storage. */
export const encryptCredentials = (agencyId, data) => {
  const iv = crypto.randomBytes(IV_LEN)
  const cipher = crypto.createCipheriv(ALGO, deriveKey(agencyId), iv)
  const json = JSON.stringify(data)
  const enc = Buffer.concat([cipher.update(json, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, enc]).toString('base64')
}

/** Decrypt stored credentials. */
export const decryptCredentials = (agencyId, payload) => {
  const buf = Buffer.from(payload, 'base64')
  const iv = buf.subarray(0, IV_LEN)
  const tag = buf.subarray(IV_LEN, IV_LEN + TAG_LEN)
  const enc = buf.subarray(IV_LEN + TAG_LEN)
  const decipher = crypto.createDecipheriv(ALGO, deriveKey(agencyId), iv)
  decipher.setAuthTag(tag)
  const json = Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8')
  return JSON.parse(json)
}

/** Mask sensitive values for API responses. */
export const maskSecret = (value) => {
  if (!value) return ''
  if (value.length <= 4) return '****'
  return `${value.slice(0, 2)}${'*'.repeat(Math.min(value.length - 4, 12))}${value.slice(-2)}`
}
