import nodemailer from 'nodemailer'
import fs from 'fs'
import path from 'path'

interface SendEmailOptions {
  email:   string
  subject: string
  message: string
  html?:   string
}

export async function sendEmail(options: SendEmailOptions) {
  const host = process.env.SMTP_HOST
  const port = Number(process.env.SMTP_PORT ?? 587)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS?.replace(/\s+/g, '')
  const from = process.env.SMTP_FROM ?? `"DoctorFit" <noreply@doctorfit.com>`

  const logPath = path.resolve(process.cwd(), 'email-debug.log')
  const timestamp = new Date().toISOString()

  const logMessage = (msg: string) => {
    console.log(msg)
    try {
      fs.appendFileSync(logPath, `[${timestamp}] ${msg}\n`)
    } catch (err) {
      // ignore log write errors
    }
  }

  logMessage(`--- Email Send Attempt ---`)
  logMessage(`Recipient: ${options.email}`)
  logMessage(`Subject: ${options.subject}`)
  logMessage(`SMTP_HOST: ${host}`)
  logMessage(`SMTP_PORT: ${port}`)
  logMessage(`SMTP_USER: ${user}`)
  logMessage(`SMTP_PASS Length: ${pass?.length ?? 0}`)

  if (!host || !user || !pass) {
    logMessage('✉️  [SMTP NOT CONFIGURED] Creating temporary test email account...')
    try {
      const testAccount = await nodemailer.createTestAccount()
      const testTransporter = nodemailer.createTransport({
        host: testAccount.smtp.host,
        port: testAccount.smtp.port,
        secure: testAccount.smtp.secure,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      })
      const info = await testTransporter.sendMail({
        from: `"DoctorFit Test" <${testAccount.user}>`,
        to:      options.email,
        subject: options.subject,
        text:    options.message,
        html:    options.html,
      })
      const previewUrl = nodemailer.getTestMessageUrl(info)
      logMessage('✅ Test email sent successfully!')
      logMessage(`Preview URL: ${previewUrl}`)
      logMessage('--------------------------------------------------\n')
      return
    } catch (err) {
      logMessage(`❌ Failed to send test email through Ethereal: ${(err as Error).message}`)
      logMessage(`✉️  [FALLBACK] Email would be sent to: ${options.email}`)
      logMessage('--------------------------------------------------\n')
      return
    }
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true for 465, false for other ports
      auth: { user, pass },
      connectionTimeout: 10000, // 10s timeout
      greetingTimeout: 10000,
    })

    logMessage('Connecting and sending email via Nodemailer...')
    const info = await transporter.sendMail({
      from,
      to:      options.email,
      subject: options.subject,
      text:    options.message,
      html:    options.html,
    })
    logMessage(`✅ Email sent successfully! MessageId: ${info.messageId}`)
    logMessage('--------------------------------------------------\n')
  } catch (err) {
    logMessage(`❌ Failed to send email via real SMTP: ${(err as Error).message}`)
    throw err
  }
}

