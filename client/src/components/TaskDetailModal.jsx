import React, { useState } from 'react';
import { X, Calendar, User, Tag, MessageSquare, Trash2, Share2, Clock } from 'lucide-react';
import ColorIconPicker from './ColorIconPicker';

const TaskDetailModal = ({ task, onClose, onUpdate, onDelete, onCreate, currentUser }) => {
    const isNew = !task;

    const [title, setTitle] = useState(task?.title || '');
    const [description, setDescription] = useState(task?.description || '');
    const [status, setStatus] = useState(task?.status || 'todo');
    const [priority, setPriority] = useState(task?.priority || 'medium');
    const [isPublic, setIsPublic] = useState(task?.isPublic || false);

    // Nouveaux champs
    const [startDate, setStartDate] = useState(task?.startDate ? new Date(task.startDate).toISOString().split('T')[0] : '');
    const [dueDate, setDueDate] = useState(task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
    const [color, setColor] = useState(task?.color || null);
    const [icon, setIcon] = useState(task?.icon || null);

    const handleSave = () => {
        const taskData = {
            title,
            description,
            status,
            priority,
            isPublic,
            startDate: startDate ? new Date(startDate).toISOString() : null,
            dueDate: dueDate ? new Date(dueDate).toISOString() : null,
            color,
            icon
        };

        if (isNew) {
            onCreate({
                ...taskData,
                userId: currentUser.id
            });
        } else {
            onUpdate(task.id, taskData);
        }
        onClose();
    };

    const handleDelete = () => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
            onDelete(task.id);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between z-10">
                    <div className="flex items-center gap-3">
                        {icon && <span className="material-icons text-indigo-600">{icon}</span>}
                        <h2 className="text-xl font-bold text-slate-900">
                            {isNew ? 'Nouvelle Tâche' : 'Détails de la tâche'}
                        </h2>
                    </div>
                    <div className="flex items-center gap-2">
                        {!isNew && (
                            <button
                                onClick={handleDelete}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Supprimer"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Title Input */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Titre
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-lg font-medium"
                            placeholder="Titre de la tâche"
                        />
                    </div>

                    {/* Dates & Status Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Dates */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Date de début
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Date d'échéance
                                </label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="date"
                                        value={dueDate}
                                        onChange={(e) => setDueDate(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Status & Priority */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Statut
                                </label>
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="todo">À faire</option>
                                    <option value="doing">En cours</option>
                                    <option value="done">Terminé</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    Priorité
                                </label>
                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                >
                                    <option value="low">Basse</option>
                                    <option value="medium">Moyenne</option>
                                    <option value="high">Haute</option>
                                    <option value="urgent">Urgente</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Color & Icon Picker */}
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <h3 className="text-sm font-medium text-slate-900 mb-4">Apparence</h3>
                        <ColorIconPicker
                            selectedColor={color}
                            selectedIcon={icon}
                            onColorChange={setColor}
                            onIconChange={setIcon}
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            placeholder="Description détaillée..."
                        />
                    </div>

                    {/* Visibility Toggle */}
                    <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <Share2 className={`w-5 h-5 ${isPublic ? 'text-indigo-600' : 'text-slate-400'}`} />
                        <div className="flex-1">
                            <span className="block text-sm font-medium text-slate-900">Visibilité publique</span>
                            <span className="block text-xs text-slate-500">Visible par toute l'équipe dans le dashboard</span>
                        </div>
                        <button
                            onClick={() => setIsPublic(!isPublic)}
                            className={`relative w-12 h-6 rounded-full transition ${isPublic ? 'bg-indigo-600' : 'bg-slate-300'
                                }`}
                        >
                            <span
                                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${isPublic ? 'translate-x-6' : 'translate-x-0'
                                    }`}
                            />
                        </button>
                    </div>

                    {/* Metadata (Only for existing tasks) */}
                    {!isNew && (
                        <div className="flex items-center gap-4 text-sm text-slate-500 pt-4 border-t border-slate-100">
                            <div className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                <span>{task.user?.name || currentUser?.name}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{new Date(task.createdAt).toLocaleDateString('fr-FR')}</span>
                            </div>
                            {task.comments?.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4" />
                                    <span>{task.comments.length} commentaire(s)</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 p-6 flex items-center justify-between">
                    {isNew ? (
                        <div></div> // Spacer
                    ) : (
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                            <Trash2 className="w-4 h-4" />
                            Supprimer
                        </button>
                    )}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                        >
                            Annuler
                        </button>
                        <button
                            onClick={handleSave}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium shadow-sm"
                        >
                            {isNew ? 'Créer la tâche' : 'Enregistrer'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TaskDetailModal;
