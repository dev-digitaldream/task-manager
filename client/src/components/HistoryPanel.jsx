import React, { useState, useEffect } from 'react'
import { History, X } from 'lucide-react'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'

const HistoryPanel = ({ taskId, onClose }) => {
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchHistory()
  }, [taskId])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/tasks/${taskId}/history`)
      if (response.ok) {
        const data = await response.json()
        setHistory(data)
      }
    } catch (error) {
      console.error('Failed to fetch history:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActionLabel = (log) => {
    if (log.action === 'created') {
      return 'a créé la tâche'
    }

    if (log.action === 'updated' && log.field) {
      const fieldLabels = {
        title: 'le titre',
        status: 'le statut',
        assignee: 'l\'assignation',
        priority: 'la priorité',
        dueDate: 'la date limite',
        isPublic: 'la visibilité',
        clientApproval: 'l\'approbation client'
      }
      return `a modifié ${fieldLabels[log.field] || log.field}`
    }

    return log.action
  }

  const getChangeDetails = (log) => {
    if (!log.field || !log.oldValue || !log.newValue) return null

    const formatValue = (value, field) => {
      if (field === 'dueDate') {
        return new Date(value).toLocaleDateString('fr-FR')
      }
      if (field === 'isPublic') {
        return value === 'true' ? 'Public' : 'Privé'
      }
      return value
    }

    return (
      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
        <span className="line-through">{formatValue(log.oldValue, log.field)}</span>
        {' → '}
        <span className="font-medium">{formatValue(log.newValue, log.field)}</span>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <History size={20} className="text-gray-600 dark:text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Historique des modifications
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <X size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Chargement...
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Aucun historique disponible
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((log) => (
                <div key={log.id} className="flex gap-3">
                  <div className="flex-shrink-0 w-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-sm text-gray-900 dark:text-white">
                          {log.user && (
                            <span className="font-medium">
                              {log.user.avatar} {log.user.name}
                            </span>
                          )}
                          {!log.user && <span className="font-medium">Système</span>}
                          {' '}
                          <span className="text-gray-600 dark:text-gray-400">
                            {getActionLabel(log)}
                          </span>
                        </div>
                        {getChangeDetails(log)}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-4">
                        {formatDistanceToNow(parseISO(log.createdAt), {
                          addSuffix: true,
                          locale: fr
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default HistoryPanel
