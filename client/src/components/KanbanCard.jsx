import React, { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, User, MessageCircle, Trash2, Eye, EyeOff, GripVertical, Edit } from 'lucide-react'
import { formatDistanceToNow, isAfter, parseISO } from 'date-fns'
import { fr } from 'date-fns/locale'
import CommentSection from './CommentSection'

const KanbanCard = ({
  task,
  users,
  currentUser,
  onUpdateTask,
  onDeleteTask,
  onAddComment,
  onSetVisibility,
  isDragging
}) => {
  const [showComments, setShowComments] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging || isSortableDragging ? 0.5 : 1,
  }

  const isOverdue = task.dueDate && isAfter(new Date(), parseISO(task.dueDate)) && task.status !== 'done'
  const priority = task.priority || 'medium'

  const getPriorityColor = (p) => {
    const map = {
      low: 'bg-gray-400 dark:bg-gray-500',
      medium: 'bg-yellow-500',
      high: 'bg-orange-500',
      urgent: 'bg-red-500'
    }
    return map[p] || map.medium
  }

  const getPriorityBorderColor = (p) => {
    const map = {
      low: 'border-l-gray-400 dark:border-l-gray-500',
      medium: 'border-l-yellow-500',
      high: 'border-l-orange-500',
      urgent: 'border-l-red-500'
    }
    return map[p] || map.medium
  }

  const getPriorityLabel = (p) => {
    const map = { low: 'Basse', medium: 'Moyenne', high: 'Haute', urgent: 'Urgente' }
    return map[p] || 'Moyenne'
  }

  const handleDelete = async () => {
    if (window.confirm('Supprimer cette tâche ?')) {
      try {
        await onDeleteTask(task.id)
      } catch (error) {
        console.error('Failed to delete task:', error)
      }
    }
  }

  const handleVisibilityToggle = async () => {
    if (onSetVisibility) {
      try {
        await onSetVisibility(task.id, !task.isPublic)
      } catch (error) {
        console.error('Failed to toggle visibility:', error)
      }
    }
  }

  const isOwner = currentUser && task.ownerId === currentUser.id

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="group relative"
    >
      <div
        className={`bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md border-l-4 border-r border-t border-b transition-all ${
          getPriorityBorderColor(priority)
        } ${
          isOverdue ? 'border-red-200 dark:border-red-800' : 'border-gray-200 dark:border-gray-700'
        }`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Drag Handle */}
        <div
          {...listeners}
          className="absolute top-2 left-2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <GripVertical size={18} className="text-gray-400" />
        </div>

        <div className="p-4 pl-10">
          {/* Priority & Visibility Badges */}
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-gray-50 dark:bg-gray-700/50 text-xs">
              <div className={`w-2 h-2 rounded-full ${getPriorityColor(priority)}`}></div>
              <span className="font-medium text-gray-700 dark:text-gray-300">{getPriorityLabel(priority)}</span>
            </div>

            {task.isPublic && (
              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-xs font-medium">
                Public
              </span>
            )}

            {isOverdue && (
              <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-md text-xs font-medium">
                En retard
              </span>
            )}
          </div>

          {/* Title */}
          <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
            {task.title}
          </h4>

          {/* Metadata */}
          <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
            {task.assignee && (
              <div className="flex items-center gap-1.5">
                <User size={14} />
                <span>{task.assignee.avatar} {task.assignee.name}</span>
              </div>
            )}

            {task.dueDate && (
              <div className="flex items-center gap-1.5">
                <Calendar size={14} />
                <span className={isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : ''}>
                  {formatDistanceToNow(parseISO(task.dueDate), { addSuffix: true, locale: fr })}
                </span>
              </div>
            )}

            {task.comments && task.comments.length > 0 && (
              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-1.5 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <MessageCircle size={14} />
                <span>{task.comments.length} commentaire{task.comments.length > 1 ? 's' : ''}</span>
              </button>
            )}
          </div>

          {/* Actions (shown on hover) */}
          {showActions && (
            <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              {onSetVisibility && isOwner && (
                <button
                  onClick={handleVisibilityToggle}
                  className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title={task.isPublic ? 'Rendre privé' : 'Rendre public'}
                >
                  {task.isPublic ? (
                    <Eye size={14} className="text-blue-600 dark:text-blue-400" />
                  ) : (
                    <EyeOff size={14} className="text-gray-500" />
                  )}
                </button>
              )}

              <button
                onClick={() => setShowComments(!showComments)}
                className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Commentaires"
              >
                <MessageCircle size={14} className="text-gray-600 dark:text-gray-400" />
              </button>

              {isOwner && (
                <button
                  onClick={handleDelete}
                  className="p-1.5 rounded hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors ml-auto"
                  title="Supprimer"
                >
                  <Trash2 size={14} className="text-red-600 dark:text-red-400" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Comments Section */}
        {showComments && onAddComment && (
          <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900/50">
            <CommentSection
              comments={task.comments || []}
              currentUser={currentUser}
              onAddComment={(content) => onAddComment(task.id, content)}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default KanbanCard
