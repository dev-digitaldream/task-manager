import React, { useState, useEffect } from 'react'
import { X, Bell, Mail, Save } from 'lucide-react'

const UserSettings = ({ user, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    email: user.email || '',
    notifyOnAssign: user.notifyOnAssign ?? true,
    notifyOnComplete: user.notifyOnComplete ?? true,
    notifyOnComment: user.notifyOnComment ?? true
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const handleSave = async () => {
    setSaving(true)
    setMessage('')

    try {
      const response = await fetch(`/api/users/${user.id}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        const updated = await response.json()
        setMessage('Paramètres enregistrés avec succès')
        setTimeout(() => {
          onUpdate?.(updated)
          onClose()
        }, 1000)
      } else {
        setMessage('Erreur lors de la sauvegarde')
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      setMessage('Erreur de connexion')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl max-w-lg w-full">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{user.avatar}</span>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                Paramètres de {user.name}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Email et notifications
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
          >
            <X className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">

          {/* Email */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              <Mail size={16} />
              Adresse email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
              placeholder="votre.email@example.com"
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Requis pour recevoir des notifications par email
            </p>
          </div>

          {/* Notification Preferences */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              <Bell size={16} />
              Notifications par email
            </label>

            <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.notifyOnAssign}
                  onChange={(e) => setFormData({ ...formData, notifyOnAssign: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-slate-900 focus:ring-slate-400"
                />
                <div>
                  <div className="text-sm text-slate-900 dark:text-slate-50 group-hover:text-slate-700 dark:group-hover:text-slate-300">
                    Tâche assignée
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Quand une tâche vous est assignée
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.notifyOnComplete}
                  onChange={(e) => setFormData({ ...formData, notifyOnComplete: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-slate-900 focus:ring-slate-400"
                />
                <div>
                  <div className="text-sm text-slate-900 dark:text-slate-50 group-hover:text-slate-700 dark:group-hover:text-slate-300">
                    Tâche terminée
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Quand une de vos tâches est terminée
                  </div>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={formData.notifyOnComment}
                  onChange={(e) => setFormData({ ...formData, notifyOnComment: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 dark:border-slate-700 text-slate-900 focus:ring-slate-400"
                />
                <div>
                  <div className="text-sm text-slate-900 dark:text-slate-50 group-hover:text-slate-700 dark:group-hover:text-slate-300">
                    Nouveau commentaire
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Quand quelqu'un commente vos tâches
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={`text-sm p-3 rounded-md ${
              message.includes('succès')
                ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
            }`}>
              {message}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 border-t border-slate-200 dark:border-slate-800 px-6 py-4">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-md transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-50 bg-slate-900 dark:bg-slate-50 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
          >
            <Save size={16} />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default UserSettings
