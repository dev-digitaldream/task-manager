/**
 * Task Widget - Compact desktop widget for task display
 */
import React, { useState, useEffect } from 'react'
import { Circle, CheckCircle, RefreshCw, Clock, AlertCircle } from 'lucide-react'
import { useSocket } from '../hooks/useSocket'
import { useTasks } from '../hooks/useTasks'

function TaskWidget() {
  const [currentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser')
    return saved ? JSON.parse(saved) : null
  })

  const { socket } = useSocket(currentUser?.id)
  const { tasks } = useTasks(socket)

  const myTasks = tasks.filter(t =>
    t.assigneeId === currentUser?.id && t.status !== 'done'
  ).slice(0, 10) // Limit to 10 tasks

  const getStatusIcon = (status) => {
    switch (status) {
      case 'doing': return <RefreshCw size={14} className="text-blue-500" />
      case 'done': return <CheckCircle size={14} className="text-green-500" />
      default: return <Circle size={14} className="text-gray-400" />
    }
  }

  const getPriorityColor = (priority) => {
    const colors = {
      urgent: 'border-l-red-500 bg-red-50 dark:bg-red-950',
      high: 'border-l-orange-500 bg-orange-50 dark:bg-orange-950',
      medium: 'border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950',
      low: 'border-l-gray-400 bg-gray-50 dark:bg-gray-900'
    }
    return colors[priority] || colors.medium
  }

  const isOverdue = (dueDate) => {
    if (!dueDate) return false
    return new Date(dueDate) < new Date()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          📝 Mes Tâches
          {currentUser && (
            <span className="text-xs font-normal text-gray-500 dark:text-gray-400">
              {currentUser.avatar} {currentUser.name}
            </span>
          )}
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {myTasks.length} tâche{myTasks.length > 1 ? 's' : ''} en cours
        </p>
      </div>

      <div className="space-y-2">
        {myTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-400 dark:text-gray-500">
            <CheckCircle size={32} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Aucune tâche en cours</p>
          </div>
        ) : (
          myTasks.map(task => (
            <div
              key={task.id}
              className={`p-3 rounded-lg border-l-4 ${getPriorityColor(task.priority)} shadow-sm hover:shadow-md transition-shadow`}
            >
              <div className="flex items-start gap-2">
                <div className="mt-0.5">
                  {getStatusIcon(task.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                    {task.title}
                  </p>
                  {task.dueDate && (
                    <div className={`flex items-center gap-1 mt-1 text-xs ${
                      isOverdue(task.dueDate)
                        ? 'text-red-600 dark:text-red-400 font-semibold'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {isOverdue(task.dueDate) ? (
                        <AlertCircle size={12} />
                      ) : (
                        <Clock size={12} />
                      )}
                      {new Date(task.dueDate).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {!currentUser && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg">
          <p className="text-xs text-yellow-800 dark:text-yellow-200">
            ⚠️ Connectez-vous dans l'app principale pour voir vos tâches
          </p>
        </div>
      )}
    </div>
  )
}

export default TaskWidget
