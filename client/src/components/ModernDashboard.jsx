import React, { useMemo } from 'react'
import { format, formatDistanceToNow, parseISO, isAfter } from 'date-fns'
import { fr } from 'date-fns/locale'

const ModernDashboard = ({ tasks = [], users = [], onlineUsers = [], taskCounts = { todo: 0, doing: 0, done: 0 } }) => {
  const totalTasks = tasks.length
  const progressPct = useMemo(() => {
    if (!totalTasks) return 0
    return Math.round((taskCounts.done / totalTasks) * 100)
  }, [taskCounts.done, totalTasks])

  const recentTasks = useMemo(() => {
    return tasks
      .filter(t => t.status !== 'done')
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
  }, [tasks])

  const overdueTasks = useMemo(() => {
    return tasks.filter(task => task.dueDate && isAfter(new Date(), parseISO(task.dueDate)) && task.status !== 'done')
  }, [tasks])

  const primaryUser = users[0]

  // Static week data inspired by the provided design
  const week = {
    days: ['S','M','T','W','T','F','S'],
    values: [2,3,4,3,5,1,0]
  }
  const maxWeekVal = Math.max(...week.values, 1)

  const getStatusBadge = (done) => done
    ? 'bg-yellow-400 text-white px-2 py-1 rounded-full text-xs'
    : 'bg-gray-200 text-gray-800 px-2 py-1 rounded-full text-xs'

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-50 to-yellow-50 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Welcome Card */}
        <div className="col-span-1 rounded-2xl shadow-md p-4 bg-white flex flex-col items-center">
          <h2 className="w-full text-left font-semibold text-gray-800 mb-2">Welcome</h2>
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center text-3xl">
              {primaryUser?.avatar || '👋'}
            </div>
            <div className="mt-3 text-center">
              <div className="text-lg font-semibold text-gray-900">{primaryUser?.name || 'User Name'}</div>
              <div className="text-sm text-gray-500">{primaryUser ? 'Collaborateur' : 'Project Manager'}</div>
            </div>
            <div className="mt-4 text-2xl font-bold text-gray-900">$1,200</div>
          </div>

          <div className="w-full mt-6 space-y-3">
            {[{ label: 'Interviews', value: 15, color: 'bg-yellow-400' },
              { label: 'Hired', value: 15, color: 'bg-gray-400' },
              { label: 'Project Time', value: 60, color: 'bg-yellow-400' },
              { label: 'Output', value: 10, color: 'bg-gray-300' }].map((p) => (
              <div key={p.label}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-gray-600">{p.label}</span>
                  <span className="text-gray-900 font-medium">{p.value}%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className={`${p.color} h-2`} style={{ width: `${p.value}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Work Progress */}
        <div className="col-span-1 rounded-2xl shadow-md p-4 bg-white flex flex-col">
          <h2 className="font-semibold text-gray-800 mb-2">Work Progress</h2>

          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-gray-900">6.1h</div>
              <div className="text-sm text-gray-500">Total this week</div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">{progressPct}%</div>
              <div className="text-sm text-gray-500">Project completion</div>
            </div>
          </div>

          {/* Week chart */}
          <div className="mt-6">
            <div className="flex items-end gap-2 h-24">
              {week.values.map((v, i) => (
                <div key={i} className="flex flex-col items-center justify-end h-full">
                  <div className="w-6 bg-yellow-400 rounded-t-xl" style={{ height: `${(v / maxWeekVal) * 100}%` }} />
                  <span className="text-xs mt-1 text-gray-600">{week.days[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Simple timer placeholder */}
          <div className="mt-6 p-3 bg-gray-50 rounded-xl flex items-center justify-between">
            <div>
              <div className="text-xs text-gray-500">Timer</div>
              <div className="text-xl font-mono font-semibold text-gray-900">02:35</div>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-yellow-400 text-white">running</span>
          </div>
        </div>

        {/* Kanban Todo */}
        <div className="col-span-1 rounded-2xl shadow-md p-4 bg-white flex flex-col">
          <h2 className="font-semibold text-gray-800 mb-2">Kanban Todo</h2>

          <div className="mb-4">
            <div className="flex items-center justify-between text-sm mb-1">
              <span className="text-gray-600">Onboarding</span>
              <span className="text-gray-900 font-medium">{progressPct}%</span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="bg-yellow-400 h-2" style={{ width: `${progressPct}%` }} />
            </div>
          </div>

          <div className="space-y-2">
            {(recentTasks.length > 0 ? recentTasks : tasks.slice(0,5)).map((task) => {
              const isOverdue = task.dueDate && isAfter(new Date(), parseISO(task.dueDate)) && task.status !== 'done'
              return (
                <div key={task.id || task.title} className={`p-3 rounded-2xl border ${isOverdue ? 'border-red-300 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-gray-900">{task.title || 'Task'}</div>
                      <div className="text-xs text-gray-500">
                        {task.dueDate ? format(parseISO(task.dueDate), 'MMM d, HH:mm', { locale: fr }) : '—'}
                      </div>
                    </div>
                    <span className={getStatusBadge(task.status === 'done')}>
                      {task.status === 'done' ? 'done' : 'todo'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Footer meta */}
      <div className="max-w-7xl mx-auto mt-8 text-xs text-gray-500 flex items-center justify-between">
        <div>
          {format(new Date(), 'EEEE d MMMM yyyy - HH:mm', { locale: fr })}
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700">{onlineUsers.length} en ligne</span>
          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700">{totalTasks} tâches</span>
        </div>
      </div>
    </div>
  )
}

export default ModernDashboard
