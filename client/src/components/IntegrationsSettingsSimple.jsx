import React, { useState } from 'react'
import {
  X,
  AlertCircle,
  Download,
  Upload,
  Loader2,
  Mail,
  Calendar,
  CheckSquare
} from 'lucide-react'

const INTEGRATION_TYPES = {
  ical: {
    name: 'iCal / CalDAV',
    description: 'Synchronisez vos tâches avec Apple Calendar, ou tout client compatible iCal.',
    color: 'bg-blue-500',
    icon: <Calendar className="w-8 h-8 text-blue-600" />
  },
  reminders: {
    name: 'Apple Rappels',
    description: 'Exportez vos tâches vers l\'app Rappels (macOS/iOS).',
    color: 'bg-purple-500',
    icon: <CheckSquare className="w-8 h-8 text-purple-600" />
  },
  gcal: {
    name: 'Google Calendar',
    description: 'Ajoutez vos tâches comme un agenda Google Calendar.',
    color: 'bg-red-500',
    icon: <Calendar className="w-8 h-8 text-red-600" />
  },
  outlook: {
    name: 'Microsoft Outlook',
    description: 'Add-in pour transformer vos emails en tâches.',
    color: 'bg-cyan-600',
    icon: <Mail className="w-8 h-8 text-cyan-600" />
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

  const handleDownloadManifest = () => {
    window.open('/api/integrations/outlook/manifest', '_blank');
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-auto shadow-2xl">
        <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between z-10">
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

        <div className="p-6 space-y-6">

          {/* iCal / CalDAV */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                {INTEGRATION_TYPES.ical.icon}
              </div>
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
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors disabled:opacity-50 font-medium"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    Télécharger .ics
                  </button>

                  <button
                    onClick={handleSubscribeICal}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                  >
                    <Upload size={16} />
                    Copier lien d'abonnement
                  </button>
                </div>

                {exportUrl && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-800 dark:text-blue-300 mb-1 font-medium">
                      Lien copié ! Ajoutez ce lien dans votre application calendrier :
                    </p>
                    <code className="text-xs text-blue-600 dark:text-blue-400 break-all block bg-white dark:bg-slate-900 p-2 rounded border border-blue-100 dark:border-blue-900">
                      {exportUrl}
                    </code>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Google Calendar */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                {INTEGRATION_TYPES.gcal.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {INTEGRATION_TYPES.gcal.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  {INTEGRATION_TYPES.gcal.description}
                </p>

                <button
                  onClick={handleSubscribeICal}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors font-medium"
                >
                  <Upload size={16} />
                  Obtenir l'URL pour Google Agenda
                </button>

                <p className="text-xs text-slate-500 mt-2">
                  Dans Google Agenda : Paramètres {'>'} Ajouter un agenda {'>'} À partir de l'URL
                </p>
              </div>
            </div>
          </div>

          {/* Apple Rappels */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                {INTEGRATION_TYPES.reminders.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {INTEGRATION_TYPES.reminders.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  {INTEGRATION_TYPES.reminders.description}
                </p>

                <button
                  onClick={handleExportICal}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg transition-colors disabled:opacity-50 font-medium"
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  Exporter pour Rappels
                </button>
                <p className="text-xs text-slate-500 mt-2">
                  Ouvrez le fichier téléchargé sur votre Mac ou iPhone pour l'importer dans Rappels.
                </p>
              </div>
            </div>
          </div>

          {/* Outlook Add-in */}
          <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
                {INTEGRATION_TYPES.outlook.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {INTEGRATION_TYPES.outlook.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  {INTEGRATION_TYPES.outlook.description}
                </p>

                <button
                  onClick={handleDownloadManifest}
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition-colors font-medium"
                >
                  <Download size={16} />
                  Télécharger le Manifeste (XML)
                </button>

                <div className="mt-3 p-3 bg-cyan-50 dark:bg-cyan-900/20 rounded border border-cyan-100 dark:border-cyan-900">
                  <p className="text-xs text-cyan-800 dark:text-cyan-300">
                    <strong>Installation :</strong> Dans Outlook Web, allez dans "Gérer les compléments" {'>'} "Mes compléments" {'>'} "Ajouter un complément personnalisé" {'>'} "Ajouter à partir d'un fichier".
                  </p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default IntegrationsSettingsSimple
