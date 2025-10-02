import React, { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, Users, Clock, CheckCircle, AlertTriangle, Calendar as CalendarIcon } from 'lucide-react'
import { format, subDays, parseISO, isWithinInterval } from 'date-fns'
import { fr } from 'date-fns/locale'

const Analytics = () => {
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [dateRange, setDateRange] = useState(30) // days

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [tasksRes, usersRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/users')
      ])

      setTasks(await tasksRes.json())
      setUsers(await usersRes.json())
    } catch (error) {
      console.error('Failed to fetch analytics data:', error)
    }
  }

  // Calculate metrics
  const completionRate = tasks.length > 0
    ? ((tasks.filter(t => t.status === 'done').length / tasks.length) * 100).toFixed(1)
    : 0

  const avgCompletionTime = () => {
    const completed = tasks.filter(t => t.status === 'done' && t.createdAt && t.updatedAt)
    if (completed.length === 0) return 0

    const totalHours = completed.reduce((acc, task) => {
      const created = new Date(task.createdAt)
      const updated = new Date(task.updatedAt)
      return acc + (updated - created) / (1000 * 60 * 60)
    }, 0)

    return (totalHours / completed.length).toFixed(1)
  }

  const tasksPerPriority = {
    urgent: tasks.filter(t => t.priority === 'urgent' && t.status !== 'done').length,
    high: tasks.filter(t => t.priority === 'high' && t.status !== 'done').length,
    medium: tasks.filter(t => t.priority === 'medium' && t.status !== 'done').length,
    low: tasks.filter(t => t.priority === 'low' && t.status !== 'done').length
  }

  const tasksPerUser = users.map(user => ({
    ...user,
    taskCount: tasks.filter(t => t.assigneeId === user.id).length,
    completedCount: tasks.filter(t => t.assigneeId === user.id && t.status === 'done').length,
    activeCount: tasks.filter(t => t.assigneeId === user.id && t.status !== 'done').length
  })).sort((a, b) => b.taskCount - a.taskCount)

  const recentActivity = tasks
    .filter(t => {
      const taskDate = new Date(t.updatedAt || t.createdAt)
      const cutoff = subDays(new Date(), dateRange)
      return taskDate >= cutoff
    })
    .sort((a, b) => new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt))
    .slice(0, 10)

  const overdueCount = tasks.filter(t =>
    t.dueDate &&
    new Date(t.dueDate) < new Date() &&
    t.status !== 'done'
  ).length

  const tasksByStatus = {
    todo: tasks.filter(t => t.status === 'todo').length,
    doing: tasks.filter(t => t.status === 'doing').length,
    done: tasks.filter(t => t.status === 'done').length
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
      <div className="max-w-7xl mx-auto space-y-8">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <BarChart3 className="h-8 w-8" />
              Analytics & Rapports
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">
              Vue d'ensemble des performances et statistiques
            </p>
          </div>

          <select
            value={dateRange}
            onChange={(e) => setDateRange(Number(e.target.value))}
            className="px-4 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-50"
          >
            <option value={7}>7 derniers jours</option>
            <option value={30}>30 derniers jours</option>
            <option value={90}>90 derniers jours</option>
            <option value={365}>1 an</option>
          </select>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Taux de complétion</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">{completionRate}%</p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Temps moyen</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">{avgCompletionTime()}h</p>
              </div>
              <Clock className="h-10 w-10 text-blue-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">En retard</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">{overdueCount}</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Total tâches</p>
                <p className="text-3xl font-bold text-slate-900 dark:text-slate-50">{tasks.length}</p>
              </div>
              <CalendarIcon className="h-10 w-10 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Status Distribution */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">Répartition par statut</h3>
            <div className="space-y-3">
              {Object.entries(tasksByStatus).map(([status, count]) => {
                const percentage = tasks.length > 0 ? (count / tasks.length) * 100 : 0
                const colors = {
                  todo: 'bg-slate-500',
                  doing: 'bg-blue-500',
                  done: 'bg-green-500'
                }
                const labels = {
                  todo: 'À faire',
                  doing: 'En cours',
                  done: 'Terminées'
                }

                return (
                  <div key={status}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-700 dark:text-slate-300">{labels[status]}</span>
                      <span className="font-medium text-slate-900 dark:text-slate-50">{count}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className={`${colors[status]} h-2 rounded-full transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Priority Distribution */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 mb-4">Tâches actives par priorité</h3>
            <div className="space-y-3">
              {Object.entries(tasksPerPriority).map(([priority, count]) => {
                const totalActive = Object.values(tasksPerPriority).reduce((a, b) => a + b, 0)
                const percentage = totalActive > 0 ? (count / totalActive) * 100 : 0
                const colors = {
                  urgent: 'bg-red-500',
                  high: 'bg-orange-500',
                  medium: 'bg-yellow-500',
                  low: 'bg-slate-500'
                }

                return (
                  <div key={priority}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-700 dark:text-slate-300 capitalize">{priority}</span>
                      <span className="font-medium text-slate-900 dark:text-slate-50">{count}</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className={`${colors[priority]} h-2 rounded-full transition-all`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* User Performance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
          <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50 flex items-center gap-2">
              <Users className="h-5 w-5" />
              Performance par utilisateur
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Utilisateur</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Terminées</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Actives</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Taux</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {tasksPerUser.map((user) => {
                  const rate = user.taskCount > 0 ? ((user.completedCount / user.taskCount) * 100).toFixed(0) : 0

                  return (
                    <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{user.avatar}</span>
                          <span className="font-medium text-slate-900 dark:text-slate-50">{user.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-900 dark:text-slate-50">{user.taskCount}</td>
                      <td className="px-6 py-4 text-green-600 dark:text-green-400">{user.completedCount}</td>
                      <td className="px-6 py-4 text-blue-600 dark:text-blue-400">{user.activeCount}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${rate}%` }}
                            />
                          </div>
                          <span className="text-sm text-slate-600 dark:text-slate-400">{rate}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Analytics
