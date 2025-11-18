import React, { useState, useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Plus, Filter } from 'lucide-react'
import KanbanColumn from './KanbanColumn'
import KanbanCard from './KanbanCard'
import TaskForm from './TaskForm'

const KanbanBoard = ({
  tasks,
  users,
  currentUser,
  onCreateTask,
  onUpdateTask,
  onDeleteTask,
  onAddComment,
  onSetVisibility
}) => {
  const [activeId, setActiveId] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [filterPriority, setFilterPriority] = useState('all')
  const [filterAssignee, setFilterAssignee] = useState('all')

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  )

  const columns = {
    todo: { id: 'todo', title: 'À faire', color: 'bg-gray-100 dark:bg-gray-800' },
    doing: { id: 'doing', title: 'En cours', color: 'bg-blue-100 dark:bg-blue-900/20' },
    done: { id: 'done', title: 'Terminé', color: 'bg-green-100 dark:bg-green-900/20' }
  }

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority
      const matchesAssignee = filterAssignee === 'all' || task.assigneeId === parseInt(filterAssignee)
      return matchesPriority && matchesAssignee
    })
  }, [tasks, filterPriority, filterAssignee])

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const grouped = {
      todo: [],
      doing: [],
      done: []
    }

    filteredTasks.forEach(task => {
      if (grouped[task.status]) {
        grouped[task.status].push(task)
      }
    })

    // Sort by priority and due date
    Object.keys(grouped).forEach(status => {
      grouped[status].sort((a, b) => {
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
        const priorityDiff = (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2)
        if (priorityDiff !== 0) return priorityDiff

        if (a.dueDate && b.dueDate) {
          return new Date(a.dueDate) - new Date(b.dueDate)
        }
        if (a.dueDate) return -1
        if (b.dueDate) return 1

        return new Date(b.createdAt) - new Date(a.createdAt)
      })
    })

    return grouped
  }, [filteredTasks])

  const handleDragStart = (event) => {
    setActiveId(event.active.id)
  }

  const handleDragOver = (event) => {
    const { active, over } = event

    if (!over) return

    const activeTask = tasks.find(t => t.id === active.id)
    if (!activeTask) return

    // Get the column ID from the over item (either a column or another task)
    let newStatus = null

    if (over.id === 'todo' || over.id === 'doing' || over.id === 'done') {
      // Dropped directly on column
      newStatus = over.id
    } else {
      // Dropped on a task, get that task's status
      const overTask = tasks.find(t => t.id === over.id)
      if (overTask) {
        newStatus = overTask.status
      }
    }

    if (newStatus && activeTask.status !== newStatus) {
      onUpdateTask(activeTask.id, { status: newStatus })
    }
  }

  const handleDragEnd = () => {
    setActiveId(null)
  }

  const handleCreateTask = async (taskData) => {
    try {
      await onCreateTask({
        ...taskData,
        ownerId: currentUser?.id,
        status: 'todo' // New tasks default to todo column
      })
      setShowForm(false)
    } catch (error) {
      console.error('Failed to create task:', error)
    }
  }

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null

  const getCounts = () => {
    return {
      todo: tasksByStatus.todo.length,
      doing: tasksByStatus.doing.length,
      done: tasksByStatus.done.length
    }
  }

  const counts = getCounts()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Tableau Kanban
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Glissez-déposez les cartes pour changer leur statut
          </p>
        </div>

        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          Nouvelle tâche
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-gray-500" />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filtres:</span>
        </div>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Toutes priorités</option>
          <option value="low">Basse</option>
          <option value="medium">Moyenne</option>
          <option value="high">Haute</option>
          <option value="urgent">Urgente</option>
        </select>

        <select
          value={filterAssignee}
          onChange={(e) => setFilterAssignee(e.target.value)}
          className="px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">Tous les assignés</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.avatar} {user.name}
            </option>
          ))}
        </select>

        <div className="ml-auto text-sm text-gray-600 dark:text-gray-400">
          {filteredTasks.length} tâche{filteredTasks.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Task Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto p-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Nouvelle tâche
            </h3>
            <TaskForm
              users={users}
              onSubmit={handleCreateTask}
              onCancel={() => setShowForm(false)}
            />
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {Object.values(columns).map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              color={column.color}
              count={counts[column.id]}
              tasks={tasksByStatus[column.id]}
              users={users}
              currentUser={currentUser}
              onUpdateTask={onUpdateTask}
              onDeleteTask={onDeleteTask}
              onAddComment={onAddComment}
              onSetVisibility={onSetVisibility}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="opacity-90 rotate-3 transform scale-105">
              <KanbanCard
                task={activeTask}
                users={users}
                currentUser={currentUser}
                isDragging
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{counts.todo}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">À faire</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{counts.doing}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">En cours</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">{counts.done}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Terminées</div>
          </div>
        </div>

        {counts.todo + counts.doing + counts.done > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Progression</span>
              <span className="font-semibold">
                {Math.round((counts.done / (counts.todo + counts.doing + counts.done)) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${(counts.done / (counts.todo + counts.doing + counts.done)) * 100}%`
                }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default KanbanBoard
