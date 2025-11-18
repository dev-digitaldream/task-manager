import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import KanbanCard from './KanbanCard'

const KanbanColumn = ({
  id,
  title,
  color,
  count,
  tasks,
  users,
  currentUser,
  onUpdateTask,
  onDeleteTask,
  onAddComment,
  onSetVisibility
}) => {
  const { setNodeRef, isOver } = useDroppable({
    id,
  })

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col rounded-lg transition-all ${
        isOver ? 'ring-2 ring-blue-400 dark:ring-blue-600' : ''
      }`}
    >
      {/* Column Header */}
      <div className={`${color} rounded-t-lg px-4 py-3 border-b-2 ${
        id === 'todo' ? 'border-gray-300 dark:border-gray-600' :
        id === 'doing' ? 'border-blue-400 dark:border-blue-500' :
        'border-green-400 dark:border-green-500'
      }`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <span className="bg-white dark:bg-gray-900 px-2.5 py-0.5 rounded-full text-sm font-medium text-gray-700 dark:text-gray-300">
            {count}
          </span>
        </div>
      </div>

      {/* Cards */}
      <div className={`${color} flex-1 p-3 space-y-3 min-h-[200px] rounded-b-lg`}>
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.length === 0 ? (
            <div className="text-center py-8 text-gray-400 dark:text-gray-600">
              <div className="text-4xl mb-2">
                {id === 'todo' ? '📝' : id === 'doing' ? '⚡' : '✅'}
              </div>
              <p className="text-sm">Aucune tâche</p>
            </div>
          ) : (
            tasks.map((task) => (
              <KanbanCard
                key={task.id}
                task={task}
                users={users}
                currentUser={currentUser}
                onUpdateTask={onUpdateTask}
                onDeleteTask={onDeleteTask}
                onAddComment={onAddComment}
                onSetVisibility={onSetVisibility}
              />
            ))
          )}
        </SortableContext>
      </div>
    </div>
  )
}

export default KanbanColumn
