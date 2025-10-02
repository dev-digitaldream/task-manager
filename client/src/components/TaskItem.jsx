import React, { useState, useEffect } from 'react'
import { Calendar, User, MessageCircle, Edit, Trash2, Clock, Circle, RefreshCw, CheckCircle, Info, Eye, EyeOff, History, Paperclip } from 'lucide-react'
import { formatDistanceToNow, isAfter, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import CommentSection from './CommentSection'
import HistoryPanel from './HistoryPanel'
import FileUpload from './FileUpload'

const TaskItem = ({ task, users, currentUser, onUpdate, onDelete, onEdit, onAddComment, onSetVisibility }) => {
  const [showComments, setShowComments] = useState(false)
  const [showPublicSummary, setShowPublicSummary] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [showFiles, setShowFiles] = useState(false)
  const [attachments, setAttachments] = useState([])
  const [publicSummary, setPublicSummary] = useState(task.publicSummary || '')

  useEffect(() => {
    if (showFiles) {
      fetchAttachments()
    }
  }, [showFiles, task.id])

  const fetchAttachments = async () => {
    try {
      const response = await fetch(`/api/attachments/${task.id}`)
      const data = await response.json()
      setAttachments(data)
    } catch (error) {
      console.error('Error fetching attachments:', error)
    }
  }

  const isOverdue = task.dueDate && isAfter(new Date(), parseISO(task.dueDate))
  const priority = task.priority || 'medium'
  const clientApproval = task.clientApproval || 'none'
  const approvalComment = task.approvalComment || ''
  
  const getStatusLabel = (status) => {
    const labels = {
      todo: 'À faire',
      doing: 'En cours', 
      done: 'Terminé'
    }
    return labels[status] || status
  }

  const getStatusClass = (status) => {
    return `status-indicator status-${status}`
  }

  const getPriorityColor = (p) => {
    const map = {
      low: 'bg-gray-400 dark:bg-gray-500',
      medium: 'bg-yellow-500',
      high: 'bg-orange-500',
      urgent: 'bg-red-500'
    }
    return map[p] || map.medium
  }

  const getApprovalColor = (a) => {
    const map = {
      none: 'bg-gray-400 dark:bg-gray-500',
      pending: 'bg-blue-500',
      approved: 'bg-green-500',
      rejected: 'bg-red-500'
    }
    return map[a] || map.none
  }

  const getPriorityLabel = (p) => {
    const map = { low: 'Low', medium: 'Medium', high: 'High', urgent: 'Urgent' }
    return map[p] || 'Medium'
  }

  const getApprovalLabel = (a) => {
    const map = { none: 'None', pending: 'Pending', approved: 'Approved', rejected: 'Rejected' }
    return map[a] || 'None'
  }

  const handleStatusChange = async (newStatus) => {
    try {
      await onUpdate(task.id, { status: newStatus })
    } catch (error) {
      console.error('Failed to update status:', error)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      try {
        await onDelete(task.id)
      } catch (error) {
        console.error('Failed to delete task:', error)
      }
    }
  }

  const handleVisibilityToggle = async () => {
    if (!onSetVisibility) return

    try {
      const newIsPublic = !task.isPublic
      await onSetVisibility(task.id, {
        isPublic: newIsPublic,
        publicSummary: newIsPublic ? publicSummary : null
      })
      setShowPublicSummary(false)
    } catch (error) {
      console.error('Failed to update visibility:', error)
    }
  }

  const isOwner = currentUser && task.ownerId === currentUser.id

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border transition-colors ${
      isOverdue && task.status !== 'done' 
        ? 'task-overdue border-red-200 dark:border-red-800' 
        : 'border-gray-200 dark:border-gray-700'
    }`}>
      <div className="p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {task.title}
              </h3>
              
              {/* Indicators with text beside */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Priority indicator */}
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                  <div className={`w-2 h-2 rounded-full ${getPriorityColor(priority)}`}></div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{getPriorityLabel(priority)}</span>
                </div>
                
                {/* Approval indicator */}
                {clientApproval !== 'none' && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                    <div className={`w-2 h-2 rounded-full ${getApprovalColor(clientApproval)}`}></div>
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{getApprovalLabel(clientApproval)}</span>
                  </div>
                )}
                
                {/* Public indicator */}
                {task.isPublic && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                    <Eye size={12} className="text-gray-500 dark:text-gray-400" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Public</span>
                  </div>
                )}
                
                {/* Overdue indicator */}
                {isOverdue && task.status !== 'done' && (
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <Clock size={12} className="text-red-600 dark:text-red-400" />
                    <span className="text-xs font-medium text-red-600 dark:text-red-400">Overdue</span>
                  </div>
                )}
              </div>
            </div>

            {approvalComment && (
              <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1">
                <Info size={12} className="mt-0.5" />
                <span>{approvalComment}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
              {task.assignee && (
                <div className="flex items-center gap-1">
                  <User size={14} />
                  <span>{task.assignee.avatar} {task.assignee.name}</span>
                </div>
              )}

              {task.dueDate && (
                <div className="flex items-center gap-1">
                  <Calendar size={14} />
                  <span className={isOverdue && task.status !== 'done' ? 'text-red-600 dark:text-red-400' : ''}>
                    {formatDistanceToNow(parseISO(task.dueDate), { 
                      addSuffix: true, 
                      locale: fr 
                    })}
                  </span>
                </div>
              )}

              {task.comments?.length > 0 && (
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <MessageCircle size={14} />
                  <span>{task.comments.length}</span>
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={task.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              className="px-3 py-1 rounded-lg text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="todo">À faire</option>
              <option value="doing">En cours</option>
              <option value="done">Terminé</option>
            </select>

            <button
              onClick={() => setShowHistory(true)}
              className="p-2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
              title="Historique"
            >
              <History size={16} />
            </button>

            <button
              onClick={() => setShowFiles(!showFiles)}
              className={`p-2 transition-colors ${
                showFiles
                  ? 'text-blue-600 dark:text-blue-400'
                  : 'text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
              title="Fichiers joints"
            >
              <Paperclip size={16} />
              {attachments.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {attachments.length}
                </span>
              )}
            </button>

            <button
              onClick={onEdit}
              className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              title="Modifier"
            >
              <Edit size={16} />
            </button>

            <button
              onClick={handleDelete}
              className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
              title="Supprimer"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className={`${getStatusClass(task.status)} inline-flex items-center gap-1`}>
            {/* Mobile: icon only */}
            <span className="md:hidden inline-flex items-center">
              {task.status === 'todo' && <Circle size={14} />}
              {task.status === 'doing' && <RefreshCw size={14} />}
              {task.status === 'done' && <CheckCircle size={14} />}
            </span>
            {/* Desktop: text label */}
            <span className="hidden md:inline">
              {getStatusLabel(task.status)}
            </span>
          </span>

          <div className="text-xs text-gray-500 dark:text-gray-400">
            Créé {formatDistanceToNow(parseISO(task.createdAt), { 
              addSuffix: true, 
              locale: fr 
            })}
          </div>
        </div>
      </div>

      {(showComments || task.comments?.length === 0) && (
        <CommentSection
          taskId={task.id}
          comments={task.comments || []}
          currentUser={currentUser}
          onAddComment={onAddComment}
        />
      )}

      {showFiles && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <FileUpload
            taskId={task.id}
            currentUserId={currentUser?.id}
            attachments={attachments}
            onUploadComplete={fetchAttachments}
          />
        </div>
      )}

      {isOwner && onSetVisibility && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={task.isPublic || false}
                onChange={() => {
                  if (!task.isPublic) {
                    setShowPublicSummary(true)
                  } else {
                    handleVisibilityToggle()
                  }
                }}
                className="w-4 h-4 text-blue-600 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-1">
                {task.isPublic ? <Eye size={14} /> : <EyeOff size={14} />}
                Afficher sur le dashboard public
              </span>
            </label>
          </div>

          {showPublicSummary && !task.isPublic && (
            <div className="mt-3 space-y-2">
              <label className="block text-sm text-gray-700 dark:text-gray-300">
                Résumé public (optionnel)
              </label>
              <input
                type="text"
                value={publicSummary}
                onChange={(e) => setPublicSummary(e.target.value)}
                placeholder="Laissez vide pour afficher le titre complet"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleVisibilityToggle}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                >
                  Publier
                </button>
                <button
                  onClick={() => {
                    setShowPublicSummary(false)
                    setPublicSummary(task.publicSummary || '')
                  }}
                  className="px-3 py-1 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-900 dark:text-white text-sm rounded-lg transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {task.isPublic && task.publicSummary && (
            <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
              <span className="font-medium">Résumé public:</span> {task.publicSummary}
            </div>
          )}
        </div>
      )}

      {showHistory && (
        <HistoryPanel taskId={task.id} onClose={() => setShowHistory(false)} />
      )}
    </div>
  )
}

export default TaskItem