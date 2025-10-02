import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Settings,
  Check,
  X,
  AlertCircle,
  ExternalLink,
  Eye,
  EyeOff,
  Loader2,
  Trash2
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const PROVIDERS = {
  zammad: {
    name: 'Zammad',
    color: 'bg-blue-500',
    letter: 'Z',
    fields: ['apiUrl', 'apiKey', 'defaultGroup', 'customerEmail']
  },
  osticket: {
    name: 'osTicket',
    color: 'bg-green-500',
    letter: 'O',
    fields: ['apiUrl', 'apiKey', 'defaultTopicId', 'name', 'email']
  },
  freshdesk: {
    name: 'Freshdesk',
    color: 'bg-purple-500',
    letter: 'F',
    fields: ['apiUrl', 'apiKey', 'defaultEmail']
  }
}

const IntegrationsSettings = ({ userId, onIntegrationChange }) => {
  const { t } = useTranslation()
  const [integrations, setIntegrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [configDialogOpen, setConfigDialogOpen] = useState(false)
  const [currentProvider, setCurrentProvider] = useState(null)
  const [formData, setFormData] = useState({
    provider: '',
    apiUrl: '',
    apiKey: '',
    enabled: true,
    config: {}
  })
  const [showApiKey, setShowApiKey] = useState(false)
  const [testing, setTesting] = useState(false)
  const [saving, setSaving] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchIntegrations()
  }, [userId])

  const fetchIntegrations = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/integrations?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setIntegrations(data)
      } else {
        setError(t('errors.generic'))
      }
    } catch (err) {
      console.error('Failed to fetch integrations:', err)
      setError(t('errors.networkError'))
    } finally {
      setLoading(false)
    }
  }

  const handleOpenConfig = (provider = null, existingConfig = null) => {
    setCurrentProvider(provider)
    setTestResult(null)
    setError(null)

    if (existingConfig) {
      setFormData({
        provider: existingConfig.provider,
        apiUrl: existingConfig.apiUrl || '',
        apiKey: existingConfig.apiKey || '',
        enabled: existingConfig.enabled ?? true,
        config: existingConfig.config || {}
      })
    } else {
      setFormData({
        provider: provider || '',
        apiUrl: '',
        apiKey: '',
        enabled: true,
        config: {}
      })
    }

    setConfigDialogOpen(true)
  }

  const handleCloseConfig = () => {
    setConfigDialogOpen(false)
    setCurrentProvider(null)
    setShowApiKey(false)
    setTestResult(null)
    setError(null)
  }

  const handleTestConnection = async () => {
    setTesting(true)
    setTestResult(null)
    setError(null)

    try {
      const response = await fetch('/api/integrations/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          provider: formData.provider,
          apiUrl: formData.apiUrl,
          apiKey: formData.apiKey,
          config: formData.config
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        setTestResult({ success: true, message: t('ticketing.connectionSuccess') })
      } else {
        setTestResult({
          success: false,
          message: result.message || t('ticketing.connectionFailed')
        })
      }
    } catch (err) {
      console.error('Test connection failed:', err)
      setTestResult({ success: false, message: t('errors.networkError') })
    } finally {
      setTesting(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      const response = await fetch('/api/integrations/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...formData
        })
      })

      if (response.ok) {
        const updatedIntegration = await response.json()

        // Update local state
        setIntegrations(prev => {
          const index = prev.findIndex(i => i.provider === formData.provider)
          if (index >= 0) {
            const updated = [...prev]
            updated[index] = updatedIntegration
            return updated
          } else {
            return [...prev, updatedIntegration]
          }
        })

        // Notify parent
        onIntegrationChange?.(updatedIntegration)

        handleCloseConfig()
      } else {
        const errorData = await response.json()
        setError(errorData.message || t('errors.generic'))
      }
    } catch (err) {
      console.error('Failed to save integration:', err)
      setError(t('errors.networkError'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (provider) => {
    if (!confirm(t('integrations.disconnect') + '?')) return

    try {
      const response = await fetch(`/api/integrations/${provider}?userId=${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        setIntegrations(prev => prev.filter(i => i.provider !== provider))
        onIntegrationChange?.({ provider, deleted: true })
      } else {
        setError(t('errors.generic'))
      }
    } catch (err) {
      console.error('Failed to delete integration:', err)
      setError(t('errors.networkError'))
    }
  }

  const handleToggleEnabled = async (integration) => {
    try {
      const response = await fetch('/api/integrations/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          provider: integration.provider,
          apiUrl: integration.apiUrl,
          apiKey: integration.apiKey,
          enabled: !integration.enabled,
          config: integration.config
        })
      })

      if (response.ok) {
        const updated = await response.json()
        setIntegrations(prev =>
          prev.map(i => i.provider === integration.provider ? updated : i)
        )
        onIntegrationChange?.(updated)
      }
    } catch (err) {
      console.error('Failed to toggle integration:', err)
      setError(t('errors.generic'))
    }
  }

  const getIntegrationForProvider = (provider) => {
    return integrations.find(i => i.provider === provider)
  }

  const renderProviderIcon = (provider) => {
    const config = PROVIDERS[provider]
    return (
      <div className={cn(
        'w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-xl',
        config.color
      )}>
        {config.letter}
      </div>
    )
  }

  const renderConfigField = (fieldName) => {
    const provider = PROVIDERS[formData.provider]
    if (!provider || !provider.fields.includes(fieldName)) return null

    const value = fieldName === 'apiUrl' || fieldName === 'apiKey'
      ? formData[fieldName]
      : (formData.config[fieldName] || '')

    const handleChange = (e) => {
      if (fieldName === 'apiUrl' || fieldName === 'apiKey') {
        setFormData(prev => ({ ...prev, [fieldName]: e.target.value }))
      } else {
        setFormData(prev => ({
          ...prev,
          config: { ...prev.config, [fieldName]: e.target.value }
        }))
      }
    }

    const fieldLabels = {
      apiUrl: t('ticketing.apiUrl'),
      apiKey: t('ticketing.apiKey'),
      defaultGroup: 'Default Group',
      customerEmail: 'Customer Email',
      defaultTopicId: 'Default Topic ID',
      name: 'Name',
      email: 'Email',
      defaultEmail: 'Default Email'
    }

    return (
      <div key={fieldName} className="space-y-2">
        <Label htmlFor={fieldName}>{fieldLabels[fieldName]}</Label>
        {fieldName === 'apiKey' ? (
          <div className="relative">
            <Input
              id={fieldName}
              type={showApiKey ? 'text' : 'password'}
              value={value}
              onChange={handleChange}
              placeholder="••••••••••••••••"
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowApiKey(!showApiKey)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        ) : (
          <Input
            id={fieldName}
            type={fieldName.includes('email') ? 'email' : 'text'}
            value={value}
            onChange={handleChange}
            placeholder={
              fieldName === 'apiUrl'
                ? 'https://example.com/api'
                : fieldLabels[fieldName]
            }
          />
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">{t('integrations.title')}</h2>
        <p className="text-muted-foreground">{t('integrations.ticketing')}</p>
      </div>

      {error && (
        <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-destructive">{error}</p>
          </div>
          <button onClick={() => setError(null)}>
            <X className="h-4 w-4 text-destructive" />
          </button>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(PROVIDERS).map(([key, provider]) => {
          const integration = getIntegrationForProvider(key)
          const isConnected = !!integration

          return (
            <Card key={key} className="relative">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {renderProviderIcon(key)}
                    <div>
                      <CardTitle className="text-lg">{provider.name}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {isConnected ? (
                          <Badge variant="default" className="gap-1">
                            <Check className="h-3 w-3" />
                            {t('integrations.connected')}
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1">
                            <X className="h-3 w-3" />
                            {t('integrations.disconnected')}
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                {isConnected && (
                  <>
                    <div className="text-xs text-muted-foreground">
                      <div className="flex items-center justify-between">
                        <span>{t('ticketing.lastSync')}:</span>
                        <span className="font-medium">
                          {integration.lastSync
                            ? new Date(integration.lastSync).toLocaleString()
                            : 'Never'
                          }
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`enable-${key}`}
                        checked={integration.enabled}
                        onChange={() => handleToggleEnabled(integration)}
                        className="h-4 w-4 rounded border-input"
                      />
                      <label
                        htmlFor={`enable-${key}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        {t('ticketing.syncEnabled')}
                      </label>
                    </div>
                  </>
                )}

                <div className="flex gap-2">
                  <Button
                    variant={isConnected ? "outline" : "default"}
                    size="sm"
                    className="flex-1"
                    onClick={() => handleOpenConfig(key, integration)}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    {t('integrations.configure')}
                  </Button>

                  {isConnected && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(key)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Configuration Dialog */}
      <Dialog open={configDialogOpen} onOpenChange={setConfigDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              {formData.provider && renderProviderIcon(formData.provider)}
              <span>
                {formData.provider
                  ? `${t('integrations.configure')} ${PROVIDERS[formData.provider]?.name}`
                  : t('integrations.configure')
                }
              </span>
            </DialogTitle>
            <DialogDescription>
              {t('ticketing.title')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {formData.provider && PROVIDERS[formData.provider]?.fields.map(field =>
              renderConfigField(field)
            )}

            {testResult && (
              <div className={cn(
                'rounded-lg p-4 flex items-start gap-3',
                testResult.success
                  ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                  : 'bg-destructive/10 border border-destructive/30'
              )}>
                {testResult.success ? (
                  <Check className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                )}
                <p className={cn(
                  'text-sm font-medium',
                  testResult.success
                    ? 'text-green-700 dark:text-green-300'
                    : 'text-destructive'
                )}>
                  {testResult.message}
                </p>
              </div>
            )}

            {error && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0" />
                <p className="text-sm font-medium text-destructive">{error}</p>
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleTestConnection}
              disabled={testing || !formData.apiUrl || !formData.apiKey}
            >
              {testing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {t('ticketing.testConnection')}
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleCloseConfig}
            >
              {t('common.cancel')}
            </Button>

            <Button
              onClick={handleSave}
              disabled={saving || !formData.apiUrl || !formData.apiKey}
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {t('common.loading')}
                </>
              ) : (
                t('common.save')
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default IntegrationsSettings
