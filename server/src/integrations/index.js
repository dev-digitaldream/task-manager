/**
 * Ticketing Integration Factory
 *
 * Provides a unified interface for creating ticketing system integrations
 */

const ZammadIntegration = require('./zammad.js')
const OsTicketIntegration = require('./osticket.js')
const FreshdeskIntegration = require('./freshdesk.js')

/**
 * Get the appropriate ticketing integration based on provider
 * @param {Object} config - Integration configuration
 * @param {string} config.provider - Provider name ('zammad', 'osticket', 'freshdesk')
 * @param {string} config.apiUrl - API base URL
 * @param {string} config.apiKey - API key/token
 * @param {boolean} config.enabled - Whether integration is enabled
 * @returns {TicketingIntegration|null} Integration instance or null if not supported
 */
function getTicketingIntegration(config) {
  if (!config || !config.provider) {
    return null
  }

  const provider = config.provider.toLowerCase()

  switch (provider) {
    case 'zammad':
      return new ZammadIntegration(config)

    case 'osticket':
      return new OsTicketIntegration(config)

    case 'freshdesk':
      return new FreshdeskIntegration(config)

    default:
      console.warn(`Unsupported ticketing provider: ${config.provider}`)
      return null
  }
}

module.exports = {
  getTicketingIntegration,
  ZammadIntegration,
  OsTicketIntegration,
  FreshdeskIntegration
}
