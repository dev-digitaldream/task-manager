const nodemailer = require('nodemailer')

class NotificationService {
  constructor() {
    this.transporter = null
    this.enabled = false
    this.init()
  }

  async init() {
    try {
      const emailProvider = process.env.EMAIL_PROVIDER || 'dev'

      if (emailProvider === 'dev') {
        this.transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'localhost',
          port: process.env.SMTP_PORT || 1025,
          secure: false,
          ignoreTLS: true
        })
        console.log('📧 Email notifications: DEV mode (local SMTP)')
      } else if (emailProvider === 'postmark') {
        this.transporter = nodemailer.createTransport({
          host: 'smtp.postmarkapp.com',
          port: 587,
          secure: false,
          auth: {
            user: process.env.POSTMARK_API_TOKEN,
            pass: process.env.POSTMARK_API_TOKEN
          }
        })
        console.log('📧 Email notifications: Postmark')
      } else if (emailProvider === 'sendgrid') {
        this.transporter = nodemailer.createTransport({
          host: 'smtp.sendgrid.net',
          port: 587,
          secure: false,
          auth: {
            user: 'apikey',
            pass: process.env.SENDGRID_API_KEY
          }
        })
        console.log('📧 Email notifications: SendGrid')
      }

      this.enabled = !!this.transporter
    } catch (error) {
      console.error('Failed to initialize email service:', error)
      this.enabled = false
    }
  }

  async sendTaskAssigned(task, assignee) {
    if (!this.enabled || !assignee.email || !assignee.notifyOnAssign) return

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@todo.rauwers.cloud',
      to: assignee.email,
      subject: `Nouvelle tâche assignée: ${task.title}`,
      html: `
        <h2>Nouvelle tâche assignée</h2>
        <p>Bonjour ${assignee.name},</p>
        <p>Une nouvelle tâche vous a été assignée:</p>
        <h3>${task.title}</h3>
        <p><strong>Priorité:</strong> ${task.priority || 'medium'}</p>
        ${task.dueDate ? `<p><strong>Date limite:</strong> ${new Date(task.dueDate).toLocaleDateString('fr-FR')}</p>` : ''}
        <p><a href="${process.env.CLIENT_URL || 'https://todo.rauwers.cloud'}/app">Voir la tâche</a></p>
      `
    }

    try {
      await this.transporter.sendMail(mailOptions)
      console.log(`📧 Email sent: Task assigned to ${assignee.email}`)
    } catch (error) {
      console.error('Failed to send email:', error)
    }
  }

  async sendTaskCompleted(task, owner) {
    if (!this.enabled || !owner.email || !owner.notifyOnComplete) return

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@todo.rauwers.cloud',
      to: owner.email,
      subject: `Tâche terminée: ${task.title}`,
      html: `
        <h2>Tâche terminée</h2>
        <p>Bonjour ${owner.name},</p>
        <p>La tâche suivante a été marquée comme terminée:</p>
        <h3>${task.title}</h3>
        ${task.assignee ? `<p><strong>Par:</strong> ${task.assignee.name}</p>` : ''}
        <p><a href="${process.env.CLIENT_URL || 'https://todo.rauwers.cloud'}/app">Voir les détails</a></p>
      `
    }

    try {
      await this.transporter.sendMail(mailOptions)
      console.log(`📧 Email sent: Task completed to ${owner.email}`)
    } catch (error) {
      console.error('Failed to send email:', error)
    }
  }

  async sendNewComment(task, comment, recipients) {
    if (!this.enabled) return

    for (const recipient of recipients) {
      if (!recipient.email || !recipient.notifyOnComment) continue

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@todo.rauwers.cloud',
        to: recipient.email,
        subject: `Nouveau commentaire sur "${task.title}"`,
        html: `
          <h2>Nouveau commentaire</h2>
          <p>Bonjour ${recipient.name},</p>
          <p>${comment.author.name} a ajouté un commentaire sur la tâche:</p>
          <h3>${task.title}</h3>
          <blockquote style="border-left: 3px solid #cbd5e1; padding-left: 12px; margin: 16px 0;">
            ${comment.content}
          </blockquote>
          <p><a href="${process.env.CLIENT_URL || 'https://todo.rauwers.cloud'}/app">Voir la tâche</a></p>
        `
      }

      try {
        await this.transporter.sendMail(mailOptions)
        console.log(`📧 Email sent: Comment notification to ${recipient.email}`)
      } catch (error) {
        console.error('Failed to send email:', error)
      }
    }
  }

  async sendDeadlineReminder(task, assignee) {
    if (!this.enabled || !assignee.email) return

    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@kanban.app',
      to: assignee.email,
      subject: `Rappel: Échéance demain pour "${task.title}"`,
      html: `
        <h2>Rappel d'échéance</h2>
        <p>Bonjour ${assignee.name},</p>
        <p>Cette tâche arrive à échéance demain:</p>
        <h3>${task.title}</h3>
        <p><strong>Date limite:</strong> ${new Date(task.dueDate).toLocaleDateString('fr-FR')}</p>
        <p><strong>Statut actuel:</strong> ${task.status === 'todo' ? 'À faire' : task.status === 'doing' ? 'En cours' : 'Terminé'}</p>
        <p><a href="${process.env.CLIENT_URL || 'http://localhost:5173'}/app">Voir la tâche</a></p>
      `
    }

    try {
      await this.transporter.sendMail(mailOptions)
      console.log(`📧 Email sent: Deadline reminder to ${assignee.email}`)
    } catch (error) {
      console.error('Failed to send email:', error)
    }
  }
}

module.exports = new NotificationService()
