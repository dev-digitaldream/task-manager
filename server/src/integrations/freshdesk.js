/**
 * Freshdesk Integration
 *
 * API Documentation: https://developers.freshdesk.com/api/
 */

const TicketingIntegration = require('./ticketing-base.js')

class FreshdeskIntegration extends TicketingIntegration {
  constructor(config) {
    super(config)
  }

  /**
   * Get Basic Auth header
   */
  getAuthHeader() {
    const credentials = Buffer.from(`${this.apiKey}:X`).toString('base64')
    return `Basic ${credentials}`
  }

  /**
   * Test connection to Freshdesk
   */
  async testConnection() {
    try {
      const response = await fetch(`${this.apiUrl}/api/v2/tickets?per_page=1`, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Freshdesk connection failed: ${response.status} ${response.statusText}`)
      }

      return {
        success: true,
        message: 'Connected to Freshdesk successfully'
      }
    } catch (error) {
      throw new Error(`Freshdesk connection test failed: ${error.message}`)
    }
  }

  /**
   * Create a ticket from a task
   */
  async createTicketFromTask(task) {
    try {
      const ticketData = {
        subject: task.title,
        description: task.description || task.title,
        email: this.config.defaultEmail || 'system@localhost',
        priority: task.priority ? this.mapPriority(task.priority) : 1,
        status: 2 // Open
      }

      // Add optional fields
      if (task.assigneeId && this.config.userMapping) {
        ticketData.responder_id = this.config.userMapping[task.assigneeId]
      }
      if (this.config.defaultType) {
        ticketData.type = this.config.defaultType
      }

      const response = await fetch(`${this.apiUrl}/api/v2/tickets`, {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ticketData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Failed to create ticket: ${response.status} ${JSON.stringify(errorData)}`)
      }

      const ticket = await response.json()
      return {
        success: true,
        ticketId: ticket.id,
        ticket
      }
    } catch (error) {
      throw new Error(`Failed to create Freshdesk ticket: ${error.message}`)
    }
  }

  /**
   * Sync task with existing ticket
   */
  async syncTaskWithTicket(task, ticketId) {
    try {
      const updates = {
        subject: task.title
      }

      // Map task status to Freshdesk status
      const statusMapping = {
        todo: 2,      // Open
        doing: 3,     // Pending
        done: 5       // Closed
      }
      if (task.status) {
        updates.status = statusMapping[task.status] || 2
      }

      // Map priority
      if (task.priority) {
        updates.priority = this.mapPriority(task.priority)
      }

      const response = await fetch(`${this.apiUrl}/api/v2/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Failed to sync ticket: ${response.status} ${JSON.stringify(errorData)}`)
      }

      const ticket = await response.json()
      return {
        success: true,
        ticket
      }
    } catch (error) {
      throw new Error(`Failed to sync with Freshdesk ticket: ${error.message}`)
    }
  }

  /**
   * Import ticket as task
   */
  async importTicketAsTask(ticketId) {
    try {
      const ticket = await this.getTicketDetails(ticketId)

      // Map Freshdesk status to task status
      const statusMapping = {
        2: 'todo',    // Open
        3: 'doing',   // Pending
        4: 'done',    // Resolved
        5: 'done'     // Closed
      }

      return {
        title: ticket.subject,
        description: ticket.description_text || ticket.description || '',
        status: statusMapping[ticket.status] || 'todo',
        externalId: ticket.id,
        provider: 'freshdesk'
      }
    } catch (error) {
      throw new Error(`Failed to import Freshdesk ticket: ${error.message}`)
    }
  }

  /**
   * Get ticket details
   */
  async getTicketDetails(ticketId) {
    try {
      const response = await fetch(`${this.apiUrl}/api/v2/tickets/${ticketId}`, {
        method: 'GET',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to get ticket: ${response.status} ${response.statusText}`)
      }

      const ticket = await response.json()
      return ticket
    } catch (error) {
      throw new Error(`Failed to get Freshdesk ticket details: ${error.message}`)
    }
  }

  /**
   * Update ticket
   */
  async updateTicket(ticketId, updates) {
    try {
      const response = await fetch(`${this.apiUrl}/api/v2/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Failed to update ticket: ${response.status} ${JSON.stringify(errorData)}`)
      }

      const ticket = await response.json()
      return {
        success: true,
        ticket
      }
    } catch (error) {
      throw new Error(`Failed to update Freshdesk ticket: ${error.message}`)
    }
  }

  /**
   * Add comment to ticket
   */
  async addCommentToTicket(ticketId, comment) {
    try {
      const noteData = {
        body: comment.content || comment,
        private: false
      }

      const response = await fetch(`${this.apiUrl}/api/v2/tickets/${ticketId}/notes`, {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(noteData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Failed to add note: ${response.status} ${JSON.stringify(errorData)}`)
      }

      const note = await response.json()
      return {
        success: true,
        note
      }
    } catch (error) {
      throw new Error(`Failed to add comment to Freshdesk ticket: ${error.message}`)
    }
  }
}

module.exports = FreshdeskIntegration
