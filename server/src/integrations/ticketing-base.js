/**
 * Base Ticketing Integration
 * 
 * Abstract class for ticketing system integrations
 * (Zammad, osTicket, Freshdesk, etc.)
 */

class TicketingIntegration {
  constructor(config) {
    this.config = config
    this.provider = config.provider
    this.apiUrl = config.apiUrl
    this.apiKey = config.apiKey
    this.enabled = config.enabled || false
  }

  /**
   * Test connection to ticketing system
   */
  async testConnection() {
    throw new Error('testConnection() must be implemented by subclass')
  }

  /**
   * Create a ticket from a task
   */
  async createTicketFromTask(task) {
    throw new Error('createTicketFromTask() must be implemented by subclass')
  }

  /**
   * Sync task with existing ticket
   */
  async syncTaskWithTicket(task, ticketId) {
    throw new Error('syncTaskWithTicket() must be implemented by subclass')
  }

  /**
   * Import ticket as task
   */
  async importTicketAsTask(ticketId) {
    throw new Error('importTicketAsTask() must be implemented by subclass')
  }

  /**
   * Get ticket details
   */
  async getTicketDetails(ticketId) {
    throw new Error('getTicketDetails() must be implemented by subclass')
  }

  /**
   * Update ticket
   */
  async updateTicket(ticketId, updates) {
    throw new Error('updateTicket() must be implemented by subclass')
  }

  /**
   * Add comment to ticket
   */
  async addCommentToTicket(ticketId, comment) {
    throw new Error('addCommentToTicket() must be implemented by subclass')
  }

  /**
   * Map task priority to ticket priority
   */
  mapPriority(taskPriority) {
    const mapping = {
      low: 1,
      medium: 2,
      high: 3,
      urgent: 3
    }
    return mapping[taskPriority] || 2
  }

  /**
   * Map task status to ticket status
   */
  mapStatus(taskStatus) {
    const mapping = {
      todo: 'open',
      doing: 'in_progress',
      done: 'closed'
    }
    return mapping[taskStatus] || 'open'
  }
}

module.exports = TicketingIntegration
