import React, { useState } from 'react'
import {
  X,
  AlertCircle,
  Download,
  Upload
} from 'lucide-react'

const INTEGRATION_TYPES = {
  ical: {
    name: 'iCal / CalDAV',
    description: 'Synchronisez vos tâches avec Apple Calendar, Google Calendar, ou tout client CalDAV',
    color: 'bg-blue-500',
    icon: '📅'
  },
  reminders: {
    name: 'Apple Rappels',
    description: 'Exportez vos tâches vers l\'app Rappels (macOS/iOS)',
    color: 'bg-purple-500',
    icon: '✅'
  },
  gcal: {
    name: 'Google Calendar',
    description: 'Synchronisation avec Google Calendar via API',
    color: 'bg-red-500',
    icon: '📆'
  }
}

const IntegrationsSettingsSimple = ({ userId, onClose }) => {
  const [loading, setLoading] = useState(false)
  const [exportUrl, setExportUrl] = useState(null)

  const handleExportICal = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/tasks/export/ical?userId=${userId}`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `tasks-${new Date().toISOString().split('T')[0]}.ics`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      console.error('Export failed:', error)
      alert('Échec de l\'export')
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribeICal = async () => {
    try {
      const response = await fetch(`/api/tasks/subscribe/ical?userId=${userId}`)
      if (response.ok) {
        const data = await response.json()
        setExportUrl(data.url)

        // Copier dans le presse-papier
        await navigator.clipboard.writeText(data.url)
        alert('URL copiée dans le presse-papier!')
      }
    } catch (error) {
      console.error('Subscription failed:', error)
      alert('Échec de la génération de l\'URL')
    }
  }

  const handleExportReminders = async () => {
    // Même chose que iCal, compatible avec Apple Rappels
    await handleExportICal()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Intégrations</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Connectez vos outils favoris
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* iCal / CalDAV */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">{INTEGRATION_TYPES.ical.icon}</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {INTEGRATION_TYPES.ical.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  {INTEGRATION_TYPES.ical.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleExportICal}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    Exporter (.ics)
                  </button>

                  <button
                    onClick={handleSubscribeICal}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Upload size={16} />
                    URL d'abonnement
                  </button>
                </div>

                {exportUrl && (
                  <div className="mt-3 p-3 bg-white dark:bg-gray-900 rounded border border-blue-200 dark:border-blue-700">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      URL d'abonnement (copiée dans le presse-papier):
                    </p>
                    <code className="text-xs text-blue-600 dark:text-blue-400 break-all">
                      {exportUrl}
                    </code>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Apple Rappels */}
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-700 rounded-lg p-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">{INTEGRATION_TYPES.reminders.icon}</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {INTEGRATION_TYPES.reminders.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  {INTEGRATION_TYPES.reminders.description}
                </p>

                <button
                  onClick={handleExportReminders}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  Exporter vers Rappels
                </button>

                <div className="mt-3 p-3 bg-purple-50 dark:bg-purple-900/30 rounded border border-purple-200 dark:border-purple-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    <strong>Instructions:</strong> Après export, ouvrez le fichier .ics sur macOS/iOS.
                    Il sera automatiquement importé dans l'app Rappels.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Google Calendar (à venir) */}
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 border border-gray-200 dark:border-gray-700 rounded-lg p-6 opacity-60">
            <div className="flex items-start gap-4">
              <div className="text-4xl">{INTEGRATION_TYPES.gcal.icon}</div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {INTEGRATION_TYPES.gcal.name}
                  <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded">
                    Bientôt
                  </span>
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {INTEGRATION_TYPES.gcal.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <AlertCircle size={14} />
            <p>
              Les fichiers .ics sont compatibles avec Apple Calendar, Google Calendar, Outlook, Thunderbird, et la plupart des clients calendrier/rappels.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default IntegrationsSettingsSimple
