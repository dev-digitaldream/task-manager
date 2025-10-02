import React, { useState, useEffect } from 'react'
import { Clock, CheckSquare, AlertTriangle, TrendingUp, Users, Calendar, UserPlus } from 'lucide-react'
import { formatDistanceToNow, isAfter, parseISO, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { usePublicTasks } from '../hooks/usePublicTasks'
import { useSocket } from '../hooks/useSocket'

const Dashboard = () => {
  const { socket } = useSocket()
  const { publicTasks } = usePublicTasks(socket)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [taskToClaim, setTaskToClaim] = useState(null)
  const [claimForm, setClaimForm] = useState({ name: '', email: '' })

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const tasks = publicTasks || []

  const taskCounts = {
    todo: tasks.filter(t => t.status === 'todo').length,
    doing: tasks.filter(t => t.status === 'doing').length,
    done: tasks.filter(t => t.status === 'done').length
  }

  const overdueTasks = tasks.filter(task =>
    task.dueDate &&
    isAfter(new Date(), parseISO(task.dueDate)) &&
    task.status !== 'done'
  )

  const urgentTasks = tasks.filter(task => {
    if (!task.dueDate || task.status === 'done') return false
    const dueDate = parseISO(task.dueDate)
    const daysDiff = Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24))
    return daysDiff <= 2 && daysDiff >= 0
  })

  const recentTasks = tasks
    .filter(task => task.status !== 'done')
    .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
    .slice(0, 10)

  const assignedUsers = [...new Set(tasks.map(t => t.assignee).filter(Boolean))]

  const getProgressPercentage = () => {
    const total = tasks.length
    if (total === 0) return 0
    return Math.round((taskCounts.done / total) * 100)
  }

  const getCompletionRate = () => {
    const total = tasks.length
    if (total === 0) return 0
    return ((taskCounts.done / total) * 100).toFixed(1)
  }

  const getAvgTasksPerUser = () => {
    if (assignedUsers.length === 0) return 0
    return (tasks.length / assignedUsers.length).toFixed(1)
  }

  const handleClaimTask = (task) => {
    setTaskToClaim(task)
    setShowClaimModal(true)
  }

  const submitClaim = async () => {
    if (!taskToClaim || !claimForm.name.trim()) return

    try {
      const response = await fetch(`/api/tasks/${taskToClaim.id}/claim`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(claimForm)
      })

      if (response.ok) {
        setShowClaimModal(false)
        setTaskToClaim(null)
        setClaimForm({ name: '', email: '' })
      }
    } catch (error) {
      console.error('Failed to claim task:', error)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-end justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Dashboard Public
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Vue d'ensemble des tâches publiques en temps réel
            </p>
          </div>

          <div className="text-right">
            <div className="text-2xl font-mono tabular-nums text-slate-900 dark:text-slate-50">
              {format(currentTime, 'HH:mm:ss')}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              {format(currentTime, 'EEEE d MMMM yyyy', { locale: fr })}
            </div>
          </div>
        </div>

        {/* KPI Cards - shadcn style */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Tasks */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Total Tâches
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {tasks.length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <CheckSquare className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </div>
            </div>
          </div>

          {/* Completion Rate */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Taux de complétion
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {getCompletionRate()}%
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </div>
            </div>
          </div>

          {/* Overdue */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  En retard
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {overdueTasks.length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </div>
            </div>
          </div>

          {/* Team Members */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between space-x-4">
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  Membres actifs
                </p>
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-50">
                  {assignedUsers.length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Users className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium text-slate-900 dark:text-slate-50">
              Progression globale
            </h3>
            <span className="text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-50">
              {taskCounts.done}/{tasks.length}
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
            <div
              className="bg-slate-900 dark:bg-slate-50 h-2 rounded-full transition-all duration-500"
              style={{ width: `${getProgressPercentage()}%` }}
            ></div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
            {taskCounts.done} tâches terminées sur {tasks.length}
          </p>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">À faire</p>
                <p className="text-xl font-semibold text-slate-900 dark:text-slate-50">{taskCounts.todo}</p>
              </div>
              <div className="h-10 w-10 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <Clock className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">En cours</p>
                <p className="text-xl font-semibold text-slate-900 dark:text-slate-50">{taskCounts.doing}</p>
              </div>
              <div className="h-10 w-10 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Terminées</p>
                <p className="text-xl font-semibold text-slate-900 dark:text-slate-50">{taskCounts.done}</p>
              </div>
              <div className="h-10 w-10 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <CheckSquare className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Table */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
          <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Tâches actives ({recentTasks.length})
            </h3>
          </div>

          <div className="overflow-x-auto">
            {recentTasks.length > 0 ? (
              <table className="w-full">
                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Tâche
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Priorité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Assigné à
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Échéance
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {recentTasks.map((task) => {
                    const isOverdue = task.dueDate && isAfter(new Date(), parseISO(task.dueDate))
                    const priority = task.priority || 'medium'

                    return (
                      <tr key={task.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="text-sm font-medium text-slate-900 dark:text-slate-50">
                            {task.publicSummary || task.title}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${task.status === 'todo' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' : ''}
                            ${task.status === 'doing' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' : ''}
                            ${task.status === 'done' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' : ''}
                          `}>
                            {task.status === 'todo' ? 'À faire' : task.status === 'doing' ? 'En cours' : 'Terminé'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${priority === 'low' ? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' : ''}
                            ${priority === 'medium' ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' : ''}
                            ${priority === 'high' ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200' : ''}
                            ${priority === 'urgent' ? 'bg-slate-900 text-slate-50 dark:bg-slate-50 dark:text-slate-900' : ''}
                          `}>
                            {priority}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-slate-900 dark:text-slate-50">
                            {task.assignee ? (
                              <>
                                <span>{task.assignee.avatar}</span>
                                <span>{task.assignee.name}</span>
                              </>
                            ) : (
                              <span className="text-slate-400 dark:text-slate-500">Non assigné</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          {task.dueDate ? (
                            <div className={`text-sm ${isOverdue ? 'text-slate-900 dark:text-slate-50 font-medium' : 'text-slate-600 dark:text-slate-400'}`}>
                              {formatDistanceToNow(parseISO(task.dueDate), { addSuffix: true, locale: fr })}
                            </div>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 text-sm">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {!task.assignee && task.status !== 'done' && (
                            <button
                              onClick={() => handleClaimTask(task)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-md transition-colors"
                            >
                              <UserPlus size={14} />
                              Prendre en charge
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : (
              <div className="px-6 py-12 text-center">
                <CheckSquare className="mx-auto h-12 w-12 text-slate-300 dark:text-slate-700" />
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Aucune tâche active</p>
              </div>
            )}
          </div>
        </div>

        {/* Claim Task Modal */}
        {showClaimModal && taskToClaim && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">
                Prendre en charge cette tâche
              </h3>

              <div className="mb-4 p-3 bg-slate-50 dark:bg-slate-800 rounded-md">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-50">
                  {taskToClaim.publicSummary || taskToClaim.title}
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Votre nom <span className="text-slate-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={claimForm.name}
                    onChange={(e) => setClaimForm({ ...claimForm, name: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
                    placeholder="Jean Dupont"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Email (optionnel)
                  </label>
                  <input
                    type="email"
                    value={claimForm.email}
                    onChange={(e) => setClaimForm({ ...claimForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
                    placeholder="jean.dupont@example.com"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowClaimModal(false)
                    setTaskToClaim(null)
                    setClaimForm({ name: '', email: '' })
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-md transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={submitClaim}
                  disabled={!claimForm.name.trim()}
                  className="flex-1 px-4 py-2 text-sm font-medium text-slate-50 bg-slate-900 dark:bg-slate-50 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors"
                >
                  Confirmer
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default Dashboard