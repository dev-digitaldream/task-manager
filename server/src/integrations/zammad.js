/**
 * Zammad Ticketing Integration
 *
 * API Documentation: https://docs.zammad.org/en/latest/api/intro.html
 */

const TicketingIntegration = require('./ticketing-base.js')

class ZammadIntegration extends TicketingIntegration {
  constructor(config) {
    super(config)
  }

  /**
   * Test connection to Zammad
   */
  async testConnection() {
    try {
      const response = await fetch(`${this.apiUrl}/api/v1/users/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Zammad connection failed: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      return {
        success: true,
        message: 'Connected to Zammad successfully',
        user: data
      }
    } catch (error) {
      throw new Error(`Zammad connection test failed: ${error.message}`)
    }
  }

  /**
   * Create a ticket from a task
   */
  async createTicketFromTask(task) {
    try {
      const ticketData = {
        title: task.title,
        group: this.config.defaultGroup || 'Users',
        customer: this.config.defaultCustomer || 'system@localhost',
        article: {
          subject: task.title,
          body: task.description || task.title,
          type: 'note',
          internal: false
        }
      }

      const response = await fetch(`${this.apiUrl}/api/v1/tickets`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
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
        ticketNumber: ticket.number,
        ticket
      }
    } catch (error) {
      throw new Error(`Failed to create Zammad ticket: ${error.message}`)
    }
  }

  /**
   * Sync task with existing ticket
   */
  async syncTaskWithTicket(task, ticketId) {
    try {
      const updates = {
        title: task.title
      }

      // Map task status to Zammad state
      const statusMapping = {
        todo: 'new',
        doing: 'open',
        done: 'closed'
      }
      if (task.status) {
        updates.state = statusMapping[task.status] || 'new'
      }

      const response = await fetch(`${this.apiUrl}/api/v1/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
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
      throw new Error(`Failed to sync with Zammad ticket: ${error.message}`)
    }
  }

  /**
   * Import ticket as task
   */
  async importTicketAsTask(ticketId) {
    try {
      const ticket = await this.getTicketDetails(ticketId)

      // Map Zammad ticket to task format
      const statusMapping = {
        'new': 'todo',
        'open': 'doing',
        'pending reminder': 'doing',
        'pending close': 'doing',
        'closed': 'done'
      }

      return {
        title: ticket.title,
        description: ticket.article?.body || '',
        status: statusMapping[ticket.state?.name] || 'todo',
        externalId: ticket.id,
        externalNumber: ticket.number,
        provider: 'zammad'
      }
    } catch (error) {
      throw new Error(`Failed to import Zammad ticket: ${error.message}`)
    }
  }

  /**
   * Get ticket details
   */
  async getTicketDetails(ticketId) {
    try {
      const response = await fetch(`${this.apiUrl}/api/v1/tickets/${ticketId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        throw new Error(`Failed to get ticket: ${response.status} ${response.statusText}`)
      }

      const ticket = await response.json()
      return ticket
    } catch (error) {
      throw new Error(`Failed to get Zammad ticket details: ${error.message}`)
    }
  }

  /**
   * Update ticket
   */
  async updateTicket(ticketId, updates) {
    try {
      const response = await fetch(`${this.apiUrl}/api/v1/tickets/${ticketId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
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
      throw new Error(`Failed to update Zammad ticket: ${error.message}`)
    }
  }

  /**
   * Add comment to ticket
   */
  async addCommentToTicket(ticketId, comment) {
    try {
      const articleData = {
        ticket_id: ticketId,
        body: comment.content || comment,
        type: 'note',
        internal: false
      }

      const response = await fetch(`${this.apiUrl}/api/v1/ticket_articles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(articleData)
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(`Failed to add comment: ${response.status} ${JSON.stringify(errorData)}`)
      }

      const article = await response.json()
      return {
        success: true,
        article
      }
    } catch (error) {
      throw new Error(`Failed to add comment to Zammad ticket: ${error.message}`)
    }
  }
}

module.exports = ZammadIntegration
