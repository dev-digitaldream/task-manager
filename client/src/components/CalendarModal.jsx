import React from 'react'
import { X, Calendar, Smartphone, Monitor } from 'lucide-react'

const CalendarModal = ({ userId, userName, onClose }) => {
  const isProduction = window.location.hostname === 'todo.rauwers.cloud'
  const baseUrl = isProduction ? 'https://todo.rauwers.cloud' : window.location.origin
  const calendarUrl = `${baseUrl}/api/users/${userId}/tasks.ics`
  const webcalUrl = calendarUrl.replace(/^https?:/, 'webcal:')

  const handleSubscribe = () => {
    if (isProduction) {
      window.location.href = webcalUrl
    } else {
      const link = document.createElement('a')
      link.href = calendarUrl
      link.download = `tasks-${userName}.ics`
      link.click()
    }
    onClose()
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('URL copiée dans le presse-papier !')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Calendar className="text-blue-600 dark:text-blue-400" size={24} />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
              S'abonner au calendrier
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <X size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <p className="text-gray-600 dark:text-gray-400">
            Synchronisez vos tâches avec votre calendrier ou application de rappels préférée.
          </p>

          {/* Quick subscribe button */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <button
              onClick={handleSubscribe}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Calendar size={20} />
              {isProduction ? 'S\'abonner maintenant' : 'Télécharger le fichier .ics'}
            </button>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-2 text-center">
              {isProduction
                ? 'Ouvre directement votre application de calendrier'
                : 'En local : télécharge le fichier pour import manuel'}
            </p>
          </div>

          {/* Instructions by platform */}
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Smartphone size={18} />
              Sur iPhone / iPad
            </h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>Cliquez sur "S'abonner maintenant" ci-dessus</li>
              <li>L'app Calendrier s'ouvre automatiquement</li>
              <li>Confirmez l'ajout du calendrier d'abonnement</li>
              <li>Vos tâches apparaissent dans Reminders ou Calendar !</li>
            </ol>

            <div className="mt-4">
              <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                <Monitor size={18} />
                Sur Outlook (Desktop)
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li>Téléchargez le fichier .ics</li>
                <li>Outlook → Fichier → Ouvrir et exporter → Importer/Exporter</li>
                <li>Sélectionnez "Importer un fichier iCalendar (.ics)"</li>
                <li>Choisissez le fichier téléchargé</li>
              </ol>
            </div>

            {/* Manual subscription URL */}
            {isProduction && (
              <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  URL d'abonnement (pour configuration manuelle) :
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={webcalUrl}
                    readOnly
                    className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-900 dark:text-white font-mono"
                  />
                  <button
                    onClick={() => copyToClipboard(webcalUrl)}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded text-sm font-medium transition-colors"
                  >
                    Copier
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>💡 Astuce :</strong> L'abonnement se met à jour automatiquement. Chaque modification de tâche sera synchronisée !
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CalendarModal
