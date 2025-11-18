import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Calendar, Copy, Check, X, Smartphone, Monitor, Globe, Download } from 'lucide-react'

export default function CalendarSubscriptionSimple({ userId, userName, onClose }) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  const baseUrl = window.location.origin
  const subscribeUrl = `${baseUrl}/api/tasks/subscribe/ical?userId=${userId}`
  const downloadUrl = `${baseUrl}/api/tasks/export/ical?userId=${userId}`

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(subscribeUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleDownload = () => {
    window.open(downloadUrl, '_blank')
  }

  const handleQuickSubscribe = async () => {
    try {
      // Fetch the subscription URL
      const response = await fetch(subscribeUrl)
      if (response.ok) {
        const data = await response.json()

        // Copy to clipboard
        await navigator.clipboard.writeText(data.url)

        alert(`URL d'abonnement copiée!\n\n${data.url}\n\nCollez cette URL dans votre application de calendrier pour vous abonner.`)
      }
    } catch (err) {
      console.error('Failed to get subscription:', err)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Calendar className="text-blue-600 dark:text-blue-400" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Synchronisation Calendrier
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Exportez vos tâches vers votre calendrier
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <p className="text-gray-600 dark:text-gray-400">
            Synchronisez vos tâches avec Apple Calendar, Google Calendar, Outlook ou toute application compatible iCal/CalDAV.
          </p>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Download ICS */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                <Download size={18} className="text-blue-600 dark:text-blue-400" />
                Export unique
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Téléchargez vos tâches une seule fois (pas de synchronisation automatique)
              </p>
              <button
                onClick={handleDownload}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Télécharger (.ics)
              </button>
            </div>

            {/* Subscribe */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                <Calendar size={18} className="text-purple-600 dark:text-purple-400" />
                Abonnement
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                Synchronisation automatique en temps réel
              </p>
              <button
                onClick={handleQuickSubscribe}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Obtenir l'URL d'abonnement
              </button>
            </div>
          </div>

          {/* Platform Instructions */}
          <div className="space-y-4 border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Comment s'abonner :
            </h3>

            {/* Google Calendar */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                <Globe size={16} className="text-blue-600 dark:text-blue-400" />
                Google Calendar
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400 pl-4">
                <li>Cliquez sur "Abonnement" ci-dessus</li>
                <li>Ouvrez Google Calendar</li>
                <li>Cliquez sur "+" à côté de "Autres agendas"</li>
                <li>Sélectionnez "À partir de l'URL"</li>
                <li>Collez l'URL copiée</li>
                <li>Cliquez sur "Ajouter un agenda"</li>
              </ol>
            </div>

            {/* Apple Calendar */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                <Smartphone size={16} className="text-purple-600 dark:text-purple-400" />
                Apple Calendar (macOS/iOS)
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400 pl-4">
                <li>Cliquez sur "Abonnement" ci-dessus</li>
                <li>Ouvrez l'app Calendrier</li>
                <li>Menu "Fichier" → "Nouvel abonnement au calendrier"</li>
                <li>Collez l'URL copiée</li>
                <li>Cliquez sur "S'abonner"</li>
                <li>Vos tâches se synchroniseront automatiquement</li>
              </ol>
            </div>

            {/* Outlook */}
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                <Monitor size={16} className="text-blue-600 dark:text-blue-400" />
                Outlook
              </h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400 pl-4">
                <li>Cliquez sur "Export unique" pour télécharger le fichier</li>
                <li>Ouvrez Outlook</li>
                <li>Allez dans "Fichier" → "Ouvrir et exporter"</li>
                <li>Sélectionnez "Importer/Exporter"</li>
                <li>Choisissez le fichier .ics téléchargé</li>
              </ol>
            </div>
          </div>

          {/* Note */}
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Note:</strong> Les tâches sont exportées au format VTODO (tâches/rappels), compatible avec la plupart des applications de calendrier modernes.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
