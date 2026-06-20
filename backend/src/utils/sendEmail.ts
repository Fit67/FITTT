import nodemailer from 'nodemailer'

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

  if (!host || !user || !pass) {
    console.log('\n✉️  [SMTP NOT CONFIGURED] Creating temporary test email account...')
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
      console.log('✉️  Test email sent successfully!')
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info))
      console.log('--------------------------------------------------\n')
      return
    } catch (err) {
      console.error('Failed to send test email through Ethereal:', err)
      console.log('\n✉️  [FALLBACK] Email would be sent to:', options.email)
      console.log('Subject:', options.subject)
      console.log('Message:', options.message)
      if (options.html) console.log('HTML:', options.html)
      console.log('--------------------------------------------------\n')
      return
    }
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: { user, pass },
  })

  await transporter.sendMail({
    from,
    to:      options.email,
    subject: options.subject,
    text:    options.message,
    html:    options.html,
  })
}
