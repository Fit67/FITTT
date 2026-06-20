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
  const pass = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM ?? `"DoctorFit" <noreply@doctorfit.com>`

  if (!host || !user || !pass) {
    console.log('\n✉️  [SMTP NOT CONFIGURED] Email would be sent to:', options.email)
    console.log('Subject:', options.subject)
    console.log('Message:', options.message)
    if (options.html) console.log('HTML:', options.html)
    console.log('--------------------------------------------------\n')
    return
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
