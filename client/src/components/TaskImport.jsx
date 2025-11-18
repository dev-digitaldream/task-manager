/**
 * Task Import - Import tasks from other apps
 */
import React, { useState } from 'react'
import { X, Upload, FileText, Check, AlertCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'

function TaskImport({ currentUser, onImport, onClose }) {
  const { t } = useTranslation()
  const [importType, setImportType] = useState('csv')
  const [file, setFile] = useState(null)
  const [importing, setImporting] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    setFile(selectedFile)
    setError(null)
    setResult(null)
  }

  const parseTrelloJSON = (data) => {
    // Trello export format
    const tasks = []
    if (data.cards) {
      data.cards.forEach(card => {
        tasks.push({
          title: card.name,
          description: card.desc || '',
          status: card.closed ? 'done' : (card.idList ? 'doing' : 'todo'),
          priority: card.labels?.find(l => l.name.toLowerCase().includes('urgent')) ? 'urgent' : 'medium',
          dueDate: card.due || null
        })
      })
    }
    return tasks
  }

  const parseAsanaJSON = (data) => {
    // Asana export format
    const tasks = []
    if (data.data) {
      data.data.forEach(task => {
        tasks.push({
          title: task.name,
          description: task.notes || '',
          status: task.completed ? 'done' : 'todo',
          priority: 'medium',
          dueDate: task.due_on || null
        })
      })
    }
    return tasks
  }

  const parseCSV = (text) => {
    const lines = text.split('\n').filter(l => l.trim())
    if (lines.length < 2) throw new Error('CSV file is empty or invalid')

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
    const tasks = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''))
      const task = {}

      headers.forEach((header, index) => {
        if (header.includes('title') || header.includes('name')) {
          task.title = values[index]
        } else if (header.includes('description') || header.includes('notes')) {
          task.description = values[index]
        } else if (header.includes('status') || header.includes('state')) {
          const status = values[index].toLowerCase()
          task.status = status.includes('done') || status.includes('complete') ? 'done' :
                       status.includes('progress') || status.includes('doing') ? 'doing' : 'todo'
        } else if (header.includes('priority')) {
          const priority = values[index].toLowerCase()
          task.priority = priority.includes('urgent') ? 'urgent' :
                         priority.includes('high') ? 'high' :
                         priority.includes('low') ? 'low' : 'medium'
        } else if (header.includes('due') || header.includes('date')) {
          task.dueDate = values[index] ? new Date(values[index]).toISOString() : null
        }
      })

      if (task.title) tasks.push(task)
    }

    return tasks
  }

  const parseJSON = (text) => {
    const data = JSON.parse(text)

    // Auto-detect format
    if (data.cards) return parseTrelloJSON(data)
    if (data.data && Array.isArray(data.data)) return parseAsanaJSON(data)

    // Generic JSON array
    if (Array.isArray(data)) {
      return data.map(item => ({
        title: item.title || item.name || item.task || '',
        description: item.description || item.notes || item.desc || '',
        status: item.status || 'todo',
        priority: item.priority || 'medium',
        dueDate: item.dueDate || item.due || item.deadline || null
      }))
    }

    throw new Error('Unknown JSON format')
  }

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file')
      return
    }

    setImporting(true)
    setError(null)

    try {
      const text = await file.text()
      let tasks = []

      if (importType === 'csv') {
        tasks = parseCSV(text)
      } else if (importType === 'json' || importType === 'trello' || importType === 'asana') {
        tasks = parseJSON(text)
      }

      if (tasks.length === 0) {
        throw new Error('No tasks found in file')
      }

      // Import tasks via API
      const imported = []
      for (const task of tasks) {
        const response = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...task,
            ownerId: currentUser.id,
            isPublic: false
          })
        })

        if (response.ok) {
          const created = await response.json()
          imported.push(created)
        }
      }

      setResult({
        total: tasks.length,
        imported: imported.length,
        failed: tasks.length - imported.length
      })

      if (onImport) onImport(imported)
    } catch (err) {
      setError(err.message || 'Import failed')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Upload size={24} />
            Importer des tâches
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X size={20} className="text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Format selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Format de fichier
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'csv', label: 'CSV', desc: 'Excel, Google Sheets' },
                { value: 'json', label: 'JSON', desc: 'Format universel' },
                { value: 'trello', label: 'Trello', desc: 'Export Trello' },
                { value: 'asana', label: 'Asana', desc: 'Export Asana' }
              ].map(format => (
                <button
                  key={format.value}
                  onClick={() => setImportType(format.value)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    importType === format.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium text-gray-900 dark:text-white">{format.label}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{format.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* File upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fichier à importer
            </label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
              <input
                type="file"
                accept={importType === 'csv' ? '.csv' : '.json'}
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center gap-2"
              >
                <FileText size={48} className="text-gray-400" />
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {file ? (
                    <span className="font-medium text-blue-600 dark:text-blue-400">{file.name}</span>
                  ) : (
                    <>
                      Cliquez pour sélectionner ou glissez un fichier {importType === 'csv' ? 'CSV' : 'JSON'}
                    </>
                  )}
                </div>
              </label>
            </div>
          </div>

          {/* CSV Format Guide */}
          {importType === 'csv' && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <div className="text-sm text-blue-900 dark:text-blue-200">
                <strong>Format CSV attendu :</strong>
                <pre className="mt-2 text-xs overflow-x-auto">
{`title,description,status,priority,dueDate
Ma tâche,Description,todo,medium,2025-12-31
Tâche urgente,À faire,doing,urgent,2025-11-15`}
                </pre>
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 flex items-start gap-3">
              <Check size={20} className="text-green-600 dark:text-green-400 mt-0.5" />
              <div className="text-sm text-green-900 dark:text-green-200">
                <strong>Import réussi !</strong>
                <div className="mt-1">
                  {result.imported} tâche{result.imported > 1 ? 's' : ''} importée{result.imported > 1 ? 's' : ''}
                  {result.failed > 0 && ` (${result.failed} échec${result.failed > 1 ? 's' : ''})`}
                </div>
              </div>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 dark:text-red-400 mt-0.5" />
              <div className="text-sm text-red-900 dark:text-red-200">
                <strong>Erreur :</strong> {error}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Annuler
            </button>
            <button
              onClick={handleImport}
              disabled={!file || importing}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {importing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Import en cours...
                </>
              ) : (
                <>
                  <Upload size={16} />
                  Importer
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TaskImport
