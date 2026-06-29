import nodemailer from 'nodemailer'
import { config } from './config.js'

let transporter = null

const getTransporter = () => {
  if (transporter) return transporter
  if (!config.smtp.host) return null

  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: config.smtp.user
      ? { user: config.smtp.user, pass: config.smtp.pass }
      : undefined,
  })
  return transporter
}

export const isMailConfigured = () => Boolean(config.smtp.host)

export const sendDevisEmail = async ({ to, subject, text, html, from }) => {
  const tx = getTransporter()
  if (!tx) return { sent: false, reason: 'smtp_not_configured' }

  const info = await tx.sendMail({
    from: from || config.smtp.from,
    to,
    subject,
    text,
    html,
  })
  return { sent: true, messageId: info.messageId }
}

export const buildDevisMailto = ({ to, subject, body }) => {
  const params = new URLSearchParams()
  if (subject) params.set('subject', subject)
  if (body) params.set('body', body)
  return `mailto:${encodeURIComponent(to || '')}?${params.toString()}`
}
