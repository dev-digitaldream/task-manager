import React, { useState, useMemo } from 'react'
import { Plus, Search, X } from 'lucide-react'
import TaskForm from './TaskForm'
import TaskItem from './TaskItem'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const TaskListClean = ({
  tasks,
  users,
  currentUser,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onAddComment,
  onSetVisibility
}) => {
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterPriority, setFilterPriority] = useState('all')

  const handleCreateTask = async (taskData) => {
    try {
      const dataWithOwner = {
        ...taskData,
        ownerId: currentUser?.id
      }
      await onCreateTask(dataWithOwner)
      setShowForm(false)
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  const handleUpdateTask = async (taskId, updates) => {
    try {
      await onUpdateTask(taskId, updates)
      setEditingTask(null)
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const handleDeleteTask = async (taskId) => {
    try {
      await onDeleteTask(taskId)
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  // Filter and search tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = !searchTerm ||
        task.title.toLowerCase().includes(searchLower) ||
        task.assignee?.name.toLowerCase().includes(searchLower) ||
        task.owner?.name.toLowerCase().includes(searchLower)

      const matchesStatus = filterStatus === 'all' || task.status === filterStatus
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority

      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [tasks, searchTerm, filterStatus, filterPriority])

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const statusOrder = { doing: 0, todo: 1, done: 2 }
    const statusDiff = statusOrder[a.status] - statusOrder[b.status]

    if (statusDiff !== 0) return statusDiff

    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate) - new Date(b.dueDate)
    }
    if (a.dueDate) return -1
    if (b.dueDate) return 1

    return new Date(b.createdAt) - new Date(a.createdAt)
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Task List</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Manage and organize your tasks
          </p>
        </div>
        
        <Button onClick={() => setShowForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          New Task
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,auto] gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Search by title, assignee or owner..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-9"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full md:w-[160px]">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="doing">In Progress</SelectItem>
            <SelectItem value="done">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-full md:w-[160px]">
            <SelectValue placeholder="All priorities" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results count */}
      {(searchTerm || filterStatus !== 'all' || filterPriority !== 'all') && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'} found
          </Badge>
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <Card className="p-6">
          <TaskForm
            users={users}
            onSubmit={handleCreateTask}
            onCancel={() => setShowForm(false)}
          />
        </Card>
      )}

      {/* Edit Form */}
      {editingTask && (
        <Card className="p-6">
          <TaskForm
            users={users}
            task={editingTask}
            onSubmit={(updates) => handleUpdateTask(editingTask.id, updates)}
            onCancel={() => setEditingTask(null)}
            isEditing
          />
        </Card>
      )}

      {/* Task List */}
      <div className="space-y-3">
        {sortedTasks.length === 0 ? (
          <Card className="p-12">
            <div className="text-center">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-medium mb-2">No tasks yet</h3>
              <p className="text-sm text-muted-foreground">Create your first task to get started!</p>
            </div>
          </Card>
        ) : (
          sortedTasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              users={users}
              currentUser={currentUser}
              onUpdate={handleUpdateTask}
              onDelete={handleDeleteTask}
              onEdit={() => setEditingTask(task)}
              onAddComment={onAddComment}
              onSetVisibility={onSetVisibility}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default TaskListClean
