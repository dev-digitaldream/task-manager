import React, { useState, useEffect } from 'react'
import { Calendar, User, X } from 'lucide-react'
import RecurrenceSelector from './RecurrenceSelector'

const TaskForm = ({ users, task, onSubmit, onCancel, isEditing = false }) => {
  const [title, setTitle] = useState(task?.title || '')
  const [assigneeId, setAssigneeId] = useState(task?.assigneeId || '')
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
  )
  const [status, setStatus] = useState(task?.status || 'todo')
  const [priority, setPriority] = useState(task?.priority || 'medium')
  const [clientApproval, setClientApproval] = useState(task?.clientApproval || 'none')
  const [approvalComment, setApprovalComment] = useState(task?.approvalComment || '')
  const [isRecurring, setIsRecurring] = useState(task?.isRecurring || false)
  const [recurrencePattern, setRecurrencePattern] = useState(task?.recurrencePattern || 'weekly')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Le titre est obligatoire')
      return
    }

    setIsSubmitting(true)

    try {
      const taskData = {
        title: title.trim(),
        assigneeId: assigneeId || null,
        dueDate: dueDate || null,
        priority,
        clientApproval,
        approvalComment: approvalComment || null,
        isRecurring,
        recurrencePattern: isRecurring ? recurrencePattern : null
      }

      if (isEditing) {
        taskData.status = status
      }

      await onSubmit(taskData)
    } catch (error) {
      setError('Erreur lors de la sauvegarde')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {isEditing ? 'Modifier la tâche' : 'Nouvelle tâche'}
        </h3>
        <button
          type="button"
          onClick={onCancel}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <X size={20} />
        </button>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Titre *
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="Entrez le titre de la tâche"
          disabled={isSubmitting}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <User size={16} className="inline mr-1" />
            Assigné à
          </label>
          <select
            value={assigneeId}
            onChange={(e) => setAssigneeId(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            disabled={isSubmitting}
          >
            <option value="">Non assigné</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.avatar} {user.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Calendar size={16} className="inline mr-1" />
            Date limite
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Priorité
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            disabled={isSubmitting}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Approbation Client
          </label>
          <select
            value={clientApproval}
            onChange={(e) => setClientApproval(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            disabled={isSubmitting}
          >
            <option value="none">None</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Commentaire d'approbation (optionnel)
        </label>
        <textarea
          value={approvalComment}
          onChange={(e) => setApprovalComment(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          placeholder="Ajouter un commentaire d'approbation..."
          disabled={isSubmitting}
        />
      </div>

      {!isEditing && (
        <RecurrenceSelector
          isRecurring={isRecurring}
          recurrencePattern={recurrencePattern}
          onChange={({ isRecurring, recurrencePattern }) => {
            setIsRecurring(isRecurring)
            setRecurrencePattern(recurrencePattern)
          }}
        />
      )}

      {isEditing && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Statut
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            disabled={isSubmitting}
          >
            <option value="todo">À faire</option>
            <option value="doing">En cours</option>
            <option value="done">Terminé</option>
          </select>
        </div>
      )}

      {error && (
        <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">
          {error}
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting || !title.trim()}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition-colors"
        >
          {isSubmitting ? 'Sauvegarde...' : isEditing ? 'Modifier' : 'Créer'}
        </button>
        
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          Annuler
        </button>
      </div>
    </form>
  )
}

export default TaskForm