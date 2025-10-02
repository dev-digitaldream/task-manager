import React, { useState, useEffect } from 'react'
import { AlertTriangle, Clock, TrendingUp, CheckCircle, Calendar, Users } from 'lucide-react'
import { formatDistanceToNow, isAfter, parseISO, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useSocket } from '../hooks/useSocket'

const MeetingMode = () => {
  const { socket } = useSocket()
  const [tasks, setTasks] = useState([])
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    fetchTasks()
  }, [])

  useEffect(() => {
    if (!socket) return

    socket.on('task:created', fetchTasks)
    socket.on('task:updated', fetchTasks)
    socket.on('task:deleted', fetchTasks)

    return () => {
      socket.off('task:created', fetchTasks)
      socket.off('task:updated', fetchTasks)
      socket.off('task:deleted', fetchTasks)
    }
  }, [socket])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks')
      const data = await response.json()
      setTasks(data)
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    }
  }

  const criticalTasks = tasks.filter(task => {
    if (task.status === 'done') return false

    // Urgent priority
    if (task.priority === 'urgent') return true

    // Overdue
    if (task.dueDate && isAfter(new Date(), parseISO(task.dueDate))) return true

    // Due in next 24h with high priority
    if (task.dueDate && task.priority === 'high') {
      const dueDate = parseISO(task.dueDate)
      const hoursUntilDue = (dueDate - new Date()) / (1000 * 60 * 60)
      if (hoursUntilDue <= 24 && hoursUntilDue >= 0) return true
    }

    return false
  }).sort((a, b) => {
    // Sort: overdue first, then by priority, then by due date
    const aOverdue = a.dueDate && isAfter(new Date(), parseISO(a.dueDate))
    const bOverdue = b.dueDate && isAfter(new Date(), parseISO(b.dueDate))

    if (aOverdue && !bOverdue) return -1
    if (!aOverdue && bOverdue) return 1

    const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
    const aPriority = priorityOrder[a.priority] || 2
    const bPriority = priorityOrder[b.priority] || 2

    if (aPriority !== bPriority) return aPriority - bPriority

    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate) - new Date(b.dueDate)
    }

    return 0
  })

  const inProgressTasks = tasks.filter(t => t.status === 'doing').length
  const blockedTasks = tasks.filter(t => t.clientApproval === 'pending').length

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-end justify-between border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Mode Réunion</h1>
            <p className="text-slate-400 mt-2">Tâches critiques et urgentes</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-mono tabular-nums">{format(currentTime, 'HH:mm:ss')}</div>
            <div className="text-sm text-slate-400">{format(currentTime, 'EEEE d MMMM yyyy', { locale: fr })}</div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-red-950/30 border border-red-900/50 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-400" />
              <div>
                <p className="text-2xl font-bold">{criticalTasks.length}</p>
                <p className="text-sm text-slate-400">Tâches critiques</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-950/30 border border-blue-900/50 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold">{inProgressTasks}</p>
                <p className="text-sm text-slate-400">En cours</p>
              </div>
            </div>
          </div>

          <div className="bg-amber-950/30 border border-amber-900/50 rounded-lg p-6">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-amber-400" />
              <div>
                <p className="text-2xl font-bold">{blockedTasks}</p>
                <p className="text-sm text-slate-400">En attente approbation</p>
              </div>
            </div>
          </div>
        </div>

        {/* Critical Tasks List */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
          <div className="border-b border-slate-800 px-6 py-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-400" />
              Tâches critiques
            </h2>
          </div>

          {criticalTasks.length > 0 ? (
            <div className="divide-y divide-slate-800">
              {criticalTasks.map((task) => {
                const isOverdue = task.dueDate && isAfter(new Date(), parseISO(task.dueDate))

                return (
                  <div
                    key={task.id}
                    className={`p-6 transition-colors hover:bg-slate-800/50 ${
                      isOverdue ? 'bg-red-950/20' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-medium">{task.title}</h3>

                          {/* Priority Badge */}
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            task.priority === 'urgent' ? 'bg-red-500 text-white' :
                            task.priority === 'high' ? 'bg-orange-500 text-white' :
                            task.priority === 'medium' ? 'bg-yellow-500 text-slate-900' :
                            'bg-slate-500 text-white'
                          }`}>
                            {task.priority}
                          </span>

                          {/* Status Badge */}
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            task.status === 'doing' ? 'bg-blue-500 text-white' :
                            'bg-slate-600 text-slate-200'
                          }`}>
                            {task.status === 'doing' ? 'En cours' : 'À faire'}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-slate-400">
                          {task.assignee && (
                            <div className="flex items-center gap-1">
                              <Users size={14} />
                              <span>{task.assignee.avatar} {task.assignee.name}</span>
                            </div>
                          )}

                          {task.dueDate && (
                            <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-400 font-medium' : ''}`}>
                              <Calendar size={14} />
                              <span>
                                {isOverdue ? 'En retard: ' : ''}
                                {formatDistanceToNow(parseISO(task.dueDate), { addSuffix: true, locale: fr })}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {isOverdue && (
                        <AlertTriangle className="h-6 w-6 text-red-400 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-12 text-center">
              <CheckCircle className="mx-auto h-16 w-16 text-green-400 mb-4" />
              <p className="text-slate-400 text-lg">Aucune tâche critique</p>
              <p className="text-slate-500 text-sm mt-1">Tout est sous contrôle!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MeetingMode
