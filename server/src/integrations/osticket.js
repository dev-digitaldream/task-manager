/**
 * osTicket Integration
 *
 * API Documentation: https://github.com/osTicket/osTicket/blob/develop/setup/doc/api/tickets.md
 */

const TicketingIntegration = require('./ticketing-base.js')

class OsTicketIntegration extends TicketingIntegration {
  constructor(config) {
    super(config)
  }

  /**
   * Test connection to osTicket
   */
  async testConnection() {
    try {
      const response = await fetch(`${this.apiUrl}/api/tickets.json`, {
        method: 'GET',
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`osTicket connection failed: ${response.status} ${response.statusText}`)
      }

      return {
        success: true,
        message: 'Connected to osTicket successfully'
      }
    } catch (error) {
      throw new Error(`osTicket connection test failed: ${error.message}`)
    }
  }

  /**
   * Create a ticket from a task
   */
  async createTicketFromTask(task) {
    try {
      const ticketData = {
        alert: true,
        autorespond: true,
        source: 'API',
        name: this.config.defaultName || 'System User',
        email: this.config.defaultEmail || 'system@localhost',
        subject: task.title,
        message: task.description || task.title
      }

      // Add optional fields if configured
      if (this.config.topicId) {
        ticketData.topicId = this.config.topicId
      }
      if (task.priority) {
        ticketData.priority = this.mapPriority(task.priority)
      }

      const response = await fetch(`${this.apiUrl}/api/tickets.json`, {
        method: 'POST',
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ticketData)
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to create ticket: ${response.status} ${errorText}`)
      }

      const result = await response.json()
      return {
        success: true,
        ticketId: result.ticket_id || result.id,
        ticket: result
      }
    } catch (error) {
      throw new Error(`Failed to create osTicket ticket: ${error.message}`)
    }
  }

  /**
   * Sync task with existing ticket
   */
  async syncTaskWithTicket(task, ticketId) {
    try {
      // osTicket doesn't have a direct update endpoint, so we add a response/note
      const message = `Task updated: ${task.title}\nStatus: ${task.status}`

      const response = await fetch(`${this.apiUrl}/api/tickets/${ticketId}/response.json`, {
        method: 'POST',
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          alert: false
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to sync ticket: ${response.status} ${errorText}`)
      }

      return {
        success: true,
        message: 'Ticket synced via response'
      }
    } catch (error) {
      throw new Error(`Failed to sync with osTicket ticket: ${error.message}`)
    }
  }

  /**
   * Import ticket as task
   */
  async importTicketAsTask(ticketId) {
    try {
      const ticket = await this.getTicketDetails(ticketId)

      // Map osTicket status to task status
      const statusMapping = {
        'open': 'todo',
        'resolved': 'done',
        'closed': 'done'
      }

      return {
        title: ticket.subject,
        description: ticket.message || '',
        status: statusMapping[ticket.status?.toLowerCase()] || 'todo',
        externalId: ticket.id || ticket.ticket_id,
        provider: 'osticket'
      }
    } catch (error) {
      throw new Error(`Failed to import osTicket ticket: ${error.message}`)
    }
  }

  /**
   * Get ticket details
   */
  async getTicketDetails(ticketId) {
    try {
      const response = await fetch(`${this.apiUrl}/api/tickets/${ticketId}.json`, {
        method: 'GET',
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to get ticket: ${response.status} ${response.statusText}`)
      }

      const ticket = await response.json()
      return ticket
    } catch (error) {
      throw new Error(`Failed to get osTicket ticket details: ${error.message}`)
    }
  }

  /**
   * Update ticket
   */
  async updateTicket(ticketId, updates) {
    try {
      // osTicket uses POST to /api/tickets/:id/response.json for updates
      const message = Object.entries(updates)
        .map(([key, value]) => `${key}: ${value}`)
        .join('\n')

      const response = await fetch(`${this.apiUrl}/api/tickets/${ticketId}/response.json`, {
        method: 'POST',
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: message,
          alert: false
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to update ticket: ${response.status} ${errorText}`)
      }

      return {
        success: true,
        message: 'Ticket updated via response'
      }
    } catch (error) {
      throw new Error(`Failed to update osTicket ticket: ${error.message}`)
    }
  }

  /**
   * Add comment to ticket
   */
  async addCommentToTicket(ticketId, comment) {
    try {
      const response = await fetch(`${this.apiUrl}/api/tickets/${ticketId}/response.json`, {
        method: 'POST',
        headers: {
          'X-API-Key': this.apiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: comment.content || comment,
          alert: false
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`Failed to add comment: ${response.status} ${errorText}`)
      }

      return {
        success: true,
        message: 'Comment added to ticket'
      }
    } catch (error) {
      throw new Error(`Failed to add comment to osTicket ticket: ${error.message}`)
    }
  }
}

module.exports = OsTicketIntegration
