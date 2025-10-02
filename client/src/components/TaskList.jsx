import React, { useState, useMemo } from 'react'
import { Plus, Search, X } from 'lucide-react'
import TaskForm from './TaskForm'
import TaskItem from './TaskItem'

const TaskList = ({
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
      // Search filter
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = !searchTerm ||
        task.title.toLowerCase().includes(searchLower) ||
        task.assignee?.name.toLowerCase().includes(searchLower) ||
        task.owner?.name.toLowerCase().includes(searchLower)

      // Status filter
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus

      // Priority filter
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority

      return matchesSearch && matchesStatus && matchesPriority
    })
  }, [tasks, searchTerm, filterStatus, filterPriority])

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    // Status priority: doing > todo > done
    const statusOrder = { doing: 0, todo: 1, done: 2 }
    const statusDiff = statusOrder[a.status] - statusOrder[b.status]

    if (statusDiff !== 0) return statusDiff

    // Then by due date (overdue first, then by date)
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate) - new Date(b.dueDate)
    }
    if (a.dueDate) return -1
    if (b.dueDate) return 1

    // Finally by creation date (newest first)
    return new Date(b.createdAt) - new Date(a.createdAt)
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Liste des tâches
          </h2>
        
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={20} />
            Nouvelle tâche
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher par titre, assigné ou propriétaire..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Tous les statuts</option>
            <option value="todo">À faire</option>
            <option value="doing">En cours</option>
            <option value="done">Terminé</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Toutes priorités</option>
            <option value="low">Basse</option>
            <option value="medium">Moyenne</option>
            <option value="high">Haute</option>
            <option value="urgent">Urgente</option>
          </select>
        </div>

        {(searchTerm || filterStatus !== 'all' || filterPriority !== 'all') && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {filteredTasks.length} tâche{filteredTasks.length !== 1 ? 's' : ''} trouvée{filteredTasks.length !== 1 ? 's' : ''}
          </div>
        )}
      </div>

      {showForm && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <TaskForm
            users={users}
            onSubmit={handleCreateTask}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {editingTask && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
          <TaskForm
            users={users}
            task={editingTask}
            onSubmit={(updates) => handleUpdateTask(editingTask.id, updates)}
            onCancel={() => setEditingTask(null)}
            isEditing
          />
        </div>
      )}

      <div className="space-y-3">
        {sortedTasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <div className="text-4xl mb-4">📝</div>
            <p className="text-lg">Aucune tâche pour le moment</p>
            <p className="text-sm">Créez votre première tâche pour commencer !</p>
          </div>
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

export default TaskList