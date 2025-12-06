import React from 'react';
import { MoreHorizontal, Plus, Calendar, Clock, AlertCircle } from 'lucide-react';

const KanbanColumn = ({ title, status, tasks, onTaskClick, onStatusChange, color }) => {
  return (
    <div className="flex-1 min-w-[300px] bg-slate-50 rounded-xl p-4 flex flex-col h-full max-h-full">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${color}`} />
          <h3 className="font-bold text-slate-700">{title}</h3>
          <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-xs font-bold">
            {tasks.length}
          </span>
        </div>
        <button className="p-1 hover:bg-slate-200 rounded transition">
          <MoreHorizontal className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {tasks.map((task) => (
          <div
            key={task.id}
            onClick={() => onTaskClick(task)}
            className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition cursor-pointer group relative overflow-hidden"
          >
            {/* Color Bar */}
            {task.color && (
              <div
                className="absolute top-0 left-0 w-1 h-full"
                style={{ backgroundColor: task.color }}
              />
            )}

            {/* Header: Icon & Priority */}
            <div className="flex items-start justify-between mb-2 pl-2">
              <div className="flex items-center gap-2">
                {task.icon && (
                  <span className="material-icons text-slate-500 text-lg">
                    {task.icon}
                  </span>
                )}
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                    task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                      task.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-600'
                  }`}>
                  {task.priority === 'urgent' ? 'Urgent' :
                    task.priority === 'high' ? 'Haute' :
                      task.priority === 'medium' ? 'Moyenne' : 'Basse'}
                </span>
              </div>
            </div>

            {/* Title */}
            <h4 className="font-semibold text-slate-900 mb-2 pl-2 line-clamp-2">
              {task.title}
            </h4>

            {/* Dates */}
            {(task.startDate || task.dueDate) && (
              <div className="flex items-center gap-3 mb-3 pl-2 text-xs text-slate-500">
                {task.startDate && (
                  <div className="flex items-center gap-1" title="Date de début">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(task.startDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                  </div>
                )}
                {task.dueDate && (
                  <div className={`flex items-center gap-1 ${new Date(task.dueDate) < new Date() && task.status !== 'done'
                      ? 'text-red-600 font-bold'
                      : ''
                    }`} title="Date d'échéance">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(task.dueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</span>
                  </div>
                )}
              </div>
            )}

            {/* Footer: Avatar & Actions */}
            <div className="flex items-center justify-between pl-2 mt-2 pt-2 border-t border-slate-50">
              <div className="flex items-center gap-2">
                {task.assignee ? (
                  <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center text-xs font-bold text-indigo-700" title={task.assignee.name}>
                    {task.assignee.avatar || task.assignee.name.charAt(0)}
                  </div>
                ) : (
                  <div className="w-6 h-6 bg-slate-100 rounded-full flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-300">
                    ?
                  </div>
                )}
              </div>

              {/* Quick Move Actions (visible on hover) */}
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {status !== 'todo' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onStatusChange(task.id, 'todo'); }}
                    className="p-1 hover:bg-slate-100 rounded text-[10px] font-bold text-slate-500"
                    title="Déplacer vers À faire"
                  >
                    ←
                  </button>
                )}
                {status !== 'doing' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onStatusChange(task.id, 'doing'); }}
                    className="p-1 hover:bg-slate-100 rounded text-[10px] font-bold text-blue-500"
                    title="Déplacer vers En cours"
                  >
                    {status === 'todo' ? '→' : '←'}
                  </button>
                )}
                {status !== 'done' && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onStatusChange(task.id, 'done'); }}
                    className="p-1 hover:bg-slate-100 rounded text-[10px] font-bold text-emerald-500"
                    title="Déplacer vers Terminé"
                  >
                    →
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {tasks.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-slate-200 rounded-lg">
            <p className="text-sm text-slate-400">Aucune tâche</p>
          </div>
        )}
      </div>
    </div>
  );
};

const KanbanBoard = ({ tasks, onTaskClick, onStatusChange }) => {
  const todoTasks = tasks.filter(t => t.status === 'todo');
  const doingTasks = tasks.filter(t => t.status === 'doing');
  const doneTasks = tasks.filter(t => t.status === 'done');

  return (
    <div className="flex gap-6 h-full overflow-x-auto pb-4">
      <KanbanColumn
        title="À faire"
        status="todo"
        tasks={todoTasks}
        onTaskClick={onTaskClick}
        onStatusChange={onStatusChange}
        color="bg-slate-400"
      />
      <KanbanColumn
        title="En cours"
        status="doing"
        tasks={doingTasks}
        onTaskClick={onTaskClick}
        onStatusChange={onStatusChange}
        color="bg-blue-500"
      />
      <KanbanColumn
        title="Terminé"
        status="done"
        tasks={doneTasks}
        onTaskClick={onTaskClick}
        onStatusChange={onStatusChange}
        color="bg-emerald-500"
      />
    </div>
  );
};

export default KanbanBoard;
