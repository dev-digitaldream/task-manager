import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Plus, Check, Settings, Building } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import CreateWorkspaceModal from './CreateWorkspaceModal';
import { useNavigate } from 'react-router-dom';

const WorkspaceSwitcher = () => {
    const { workspaces, currentWorkspace, selectWorkspace, isLoading } = useWorkspace();
    const [isOpen, setIsOpen] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (isLoading) return <div className="h-14 bg-gray-100 dark:bg-gray-800 animate-pulse rounded-xl mx-4 my-2" />;

    return (
        <div className="relative px-4 py-2" ref={dropdownRef}>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex-1 flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors group min-w-0"
                >
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-violet-500/20 shrink-0">
                            {currentWorkspace?.logo || '🏢'}
                        </div>
                        <div className="flex flex-col items-start min-w-0">
                            <span className="text-sm font-semibold text-gray-200 truncate max-w-[100px]">
                                {currentWorkspace?.name || 'Select Workspace'}
                            </span>
                            <span className="text-[10px] text-gray-500 uppercase tracking-wider font-medium">
                                {currentWorkspace?.role || 'Member'}
                            </span>
                        </div>
                    </div>
                    <ChevronDown size={14} className={`text-gray-500 transition-transform duration-200 shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                <button
                    onClick={() => setShowCreateModal(true)}
                    className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    title="Create New Workspace"
                >
                    <Plus size={20} />
                </button>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-4 right-4 mt-2 bg-[#1c2128] border border-gray-700 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-2">
                        <p className="px-2 py-1 text-[10px] font-medium text-gray-500 uppercase tracking-wider">Your Workspaces</p>
                        <div className="space-y-0.5 mt-1 max-h-48 overflow-y-auto">
                            {workspaces.map((workspace) => (
                                <button
                                    key={workspace.id}
                                    onClick={() => {
                                        selectWorkspace(workspace.id);
                                        setIsOpen(false);
                                    }}
                                    className={`w-full flex items-center justify-between px-2 py-2 rounded-lg text-sm transition-colors ${
                                        currentWorkspace?.id === workspace.id
                                            ? 'bg-violet-500/10 text-violet-400'
                                            : 'text-gray-300 hover:bg-white/5'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 truncate">
                                        <span className="text-base">{workspace.logo || '🏢'}</span>
                                        <span className="truncate">{workspace.name}</span>
                                    </div>
                                    {currentWorkspace?.id === workspace.id && <Check size={14} />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-2 border-t border-gray-700 bg-gray-800/30 space-y-0.5">
                        <button
                            onClick={() => {
                                setShowCreateModal(true);
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-2 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <Plus size={16} />
                            <span>Create Workspace</span>
                        </button>
                        <button
                            onClick={() => {
                                navigate(`/workspaces/${currentWorkspace?.id}`);
                                setIsOpen(false);
                            }}
                            className="w-full flex items-center gap-2 px-2 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                            <Settings size={16} />
                            <span>Workspace Settings</span>
                        </button>
                    </div>
                </div>
            )}

            <CreateWorkspaceModal 
                isOpen={showCreateModal} 
                onClose={() => setShowCreateModal(false)} 
            />
        </div>
    );
};

export default WorkspaceSwitcher;
