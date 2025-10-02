import React, { useState, useEffect } from 'react'
import { Clock, CheckSquare, AlertTriangle, TrendingUp, Users } from 'lucide-react'
import { formatDistanceToNow, isAfter, parseISO, format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { usePublicTasks } from '../hooks/usePublicTasks'
import { useSocket } from '../hooks/useSocket'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'

const DashboardClean = () => {
  const { socket } = useSocket()
  const { publicTasks } = usePublicTasks(socket)
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
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

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-end justify-between pb-4 border-b">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Dashboard Public</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Vue d'ensemble des tâches publiques en temps réel
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-mono tabular-nums">
              {format(currentTime, 'HH:mm:ss')}
            </div>
            <div className="text-xs text-muted-foreground">
              {format(currentTime, 'EEEE d MMMM yyyy', { locale: fr })}
            </div>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tâches</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasks.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Taux de complétion</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{getProgressPercentage()}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En retard</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{overdueTasks.length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Membres actifs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{assignedUsers.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium">Progression globale</h3>
              <span className="text-sm font-semibold tabular-nums">
                {taskCounts.done}/{tasks.length}
              </span>
            </div>
            <div className="w-full bg-secondary rounded-full h-2">
              <div
                className="bg-primary h-2 rounded-full transition-all duration-500"
                style={{ width: `${getProgressPercentage()}%` }}
              ></div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {taskCounts.done} tâches terminées sur {tasks.length}
            </p>
          </CardContent>
        </Card>

        {/* Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">À faire</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-semibold">{taskCounts.todo}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">En cours</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-semibold">{taskCounts.doing}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Terminées</CardTitle>
              <CheckSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-semibold">{taskCounts.done}</div>
            </CardContent>
          </Card>
        </div>

        {/* Tasks Table */}
        <Card>
          <CardHeader>
            <CardTitle>Tâches actives ({recentTasks.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTasks.length > 0 ? (
              <div className="space-y-4">
                {recentTasks.map((task) => {
                  const isOverdue = task.dueDate && isAfter(new Date(), parseISO(task.dueDate))
                  const priority = task.priority || 'medium'

                  return (
                    <div key={task.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium truncate">
                            {task.publicSummary || task.title}
                          </p>
                          <Badge variant="outline" className="shrink-0">
                            {task.status === 'todo' ? 'À faire' : task.status === 'doing' ? 'En cours' : 'Terminé'}
                          </Badge>
                          {priority === 'high' || priority === 'urgent' ? (
                            <Badge variant="secondary" className="shrink-0">
                              {priority}
                            </Badge>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          {task.assignee && (
                            <span className="flex items-center gap-1">
                              <span>{task.assignee.avatar}</span>
                              <span>{task.assignee.name}</span>
                            </span>
                          )}
                          {task.dueDate && (
                            <span className={isOverdue ? 'text-destructive font-medium' : ''}>
                              {formatDistanceToNow(parseISO(task.dueDate), { addSuffix: true, locale: fr })}
                            </span>
                          )}
                        </div>
                      </div>
                      {!task.assignee && task.status !== 'done' && (
                        <Button variant="outline" size="sm" className="ml-4">
                          Prendre en charge
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <CheckSquare className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">Aucune tâche active</p>
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}

export default DashboardClean
