const express = require('express')
const router = express.Router()
const { getTicketingIntegration } = require('../integrations')

// In-memory storage for integration configs (use database in production)
const integrationConfigs = new Map()

/**
 * GET /api/integrations
 * Get all configured integrations for a user
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.query.userId
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' })
    }

    const userConfigs = integrationConfigs.get(userId) || {}

    // Return configs without sensitive data
    const safeConfigs = Object.entries(userConfigs).reduce((acc, [key, config]) => {
      acc[key] = {
        provider: config.provider,
        apiUrl: config.apiUrl,
        enabled: config.enabled,
        lastSync: config.lastSync || null
      }
      return acc
    }, {})

    res.json(safeConfigs)
  } catch (error) {
    console.error('Error fetching integrations:', error)
    res.status(500).json({ error: 'Failed to fetch integrations' })
  }
})

/**
 * POST /api/integrations/configure
 * Configure a ticketing integration
 */
router.post('/configure', async (req, res) => {
  try {
    const { userId, provider, apiUrl, apiKey, enabled, customConfig } = req.body

    if (!userId || !provider) {
      return res.status(400).json({ error: 'userId and provider are required' })
    }

    const config = {
      provider,
      apiUrl,
      apiKey,
      enabled: enabled !== false,
      customConfig: customConfig || {},
      lastSync: null
    }

    // Store config
    if (!integrationConfigs.has(userId)) {
      integrationConfigs.set(userId, {})
    }
    integrationConfigs.get(userId)[provider] = config

    res.json({
      success: true,
      message: `${provider} integration configured`,
      config: {
        provider: config.provider,
        apiUrl: config.apiUrl,
        enabled: config.enabled
      }
    })
  } catch (error) {
    console.error('Error configuring integration:', error)
    res.status(500).json({ error: 'Failed to configure integration' })
  }
})

/**
 * POST /api/integrations/test
 * Test connection to ticketing system
 */
router.post('/test', async (req, res) => {
  try {
    const { provider, apiUrl, apiKey, customConfig } = req.body

    if (!provider || !apiUrl || !apiKey) {
      return res.status(400).json({ error: 'provider, apiUrl, and apiKey are required' })
    }

    const integration = getTicketingIntegration({
      provider,
      apiUrl,
      apiKey,
      enabled: true,
      ...customConfig
    })

    if (!integration) {
      return res.status(400).json({ error: `Unsupported provider: ${provider}` })
    }

    const result = await integration.testConnection()
    res.json({ success: true, result })
  } catch (error) {
    console.error('Integration test failed:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Connection test failed'
    })
  }
})

/**
 * POST /api/integrations/create-ticket
 * Create a ticket from a task
 */
router.post('/create-ticket', async (req, res) => {
  try {
    const { userId, provider, taskId } = req.body

    if (!userId || !provider || !taskId) {
      return res.status(400).json({ error: 'userId, provider, and taskId are required' })
    }

    // Get integration config
    const userConfigs = integrationConfigs.get(userId)
    if (!userConfigs || !userConfigs[provider]) {
      return res.status(404).json({ error: 'Integration not configured' })
    }

    const config = userConfigs[provider]
    if (!config.enabled) {
      return res.status(400).json({ error: 'Integration is disabled' })
    }

    const integration = getTicketingIntegration(config)
    if (!integration) {
      return res.status(400).json({ error: `Unsupported provider: ${provider}` })
    }

    // Get task details (mock for now - use Prisma in production)
    const task = { id: taskId, title: 'Sample Task', description: 'Task description' }

    const ticket = await integration.createTicketFromTask(task)
    res.json({ success: true, ticket })
  } catch (error) {
    console.error('Error creating ticket:', error)
    res.status(500).json({ error: error.message || 'Failed to create ticket' })
  }
})

/**
 * POST /api/integrations/import-ticket
 * Import a ticket as a task
 */
router.post('/import-ticket', async (req, res) => {
  try {
    const { userId, provider, ticketId } = req.body

    if (!userId || !provider || !ticketId) {
      return res.status(400).json({ error: 'userId, provider, and ticketId are required' })
    }

    // Get integration config
    const userConfigs = integrationConfigs.get(userId)
    if (!userConfigs || !userConfigs[provider]) {
      return res.status(404).json({ error: 'Integration not configured' })
    }

    const config = userConfigs[provider]
    const integration = getTicketingIntegration(config)

    const task = await integration.importTicketAsTask(ticketId)
    res.json({ success: true, task })
  } catch (error) {
    console.error('Error importing ticket:', error)
    res.status(500).json({ error: error.message || 'Failed to import ticket' })
  }
})

/**
 * DELETE /api/integrations/:provider
 * Remove an integration
 */
router.delete('/:provider', async (req, res) => {
  try {
    const { provider } = req.params
    const { userId } = req.query

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' })
    }

    const userConfigs = integrationConfigs.get(userId)
    if (userConfigs && userConfigs[provider]) {
      delete userConfigs[provider]
      res.json({ success: true, message: `${provider} integration removed` })
    } else {
      res.status(404).json({ error: 'Integration not found' })
    }
  } catch (error) {
    console.error('Error removing integration:', error)
    res.status(500).json({ error: 'Failed to remove integration' })
  }
})

/**
 * GET /api/integrations/outlook/manifest
 * Serve Outlook Add-in Manifest
 */
router.get('/outlook/manifest', (req, res) => {
  const host = req.get('host');
  const protocol = req.protocol === 'https' ? 'https' : 'http';
  const baseUrl = `${protocol}://${host}`;

  const manifest = `<?xml version="1.0" encoding="UTF-8"?>
<OfficeApp
          xmlns="http://schemas.microsoft.com/office/appforoffice/1.1"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xmlns:bt="http://schemas.microsoft.com/office/officeappbasictypes/1.0"
          xmlns:mailappor="http://schemas.microsoft.com/office/mailappversionoverrides"
          xsi:type="MailApp">
  <Id>c3d8f2a1-9b4e-4c7d-8e1f-2a3b4c5d6e7f</Id>
  <Version>1.0.0.0</Version>
  <ProviderName>Digital Dream</ProviderName>
  <DefaultLocale>fr-FR</DefaultLocale>
  <DisplayName DefaultValue="FlowSpace Task Manager" />
  <Description DefaultValue="Transformez vos emails en tâches FlowSpace directement depuis Outlook." />
  <IconUrl DefaultValue="${baseUrl}/icon.png" />
  <HighResolutionIconUrl DefaultValue="${baseUrl}/icon.png" />
  <SupportUrl DefaultValue="${baseUrl}/support" />
  <AppDomains>
    <AppDomain>${baseUrl}</AppDomain>
  </AppDomains>
  <Hosts>
    <Host Name="Mailbox" />
  </Hosts>
  <Requirements>
    <Sets>
      <Set Name="Mailbox" MinVersion="1.1" />
    </Sets>
  </Requirements>
  <FormSettings>
    <Form xsi:type="ItemRead">
      <DesktopSettings>
        <SourceLocation DefaultValue="${baseUrl}/outlook-addin.html" />
        <RequestedHeight>250</RequestedHeight>
      </DesktopSettings>
    </Form>
  </FormSettings>
  <Permissions>ReadWriteItem</Permissions>
  <Rule xsi:type="RuleCollection" Mode="Or">
    <Rule xsi:type="ItemIs" ItemType="Message" FormType="Read" />
  </Rule>
  <DisableEntityHighlighting>false</DisableEntityHighlighting>
</OfficeApp>`;

  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Content-Disposition', 'attachment; filename="manifest.xml"');
  res.send(manifest);
});

module.exports = router;
