import React, { createContext, useContext, useState, useEffect } from 'react';

const WorkspaceContext = createContext();

export const useWorkspace = () => {
    const context = useContext(WorkspaceContext);
    if (!context) {
        throw new Error('useWorkspace must be used within a WorkspaceProvider');
    }
    return context;
};

export const WorkspaceProvider = ({ children, user }) => {
    const [workspaces, setWorkspaces] = useState([]);
    const [currentWorkspace, setCurrentWorkspace] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Load workspaces when user is available
    useEffect(() => {
        if (user) {
            fetchWorkspaces();
        } else {
            setWorkspaces([]);
            setCurrentWorkspace(null);
            setIsLoading(false);
        }
    }, [user]);

    const fetchWorkspaces = async () => {
        try {
            setIsLoading(true);
            const response = await fetch(`/api/workspaces?userId=${user.id}`);
            if (!response.ok) throw new Error('Failed to fetch workspaces');
            
            const data = await response.json();
            setWorkspaces(data);

            // Restore selected workspace from localStorage or default to first one
            const savedWorkspaceId = localStorage.getItem('lastWorkspaceId');
            const targetWorkspace = data.find(w => w.id === savedWorkspaceId) || data[0] || null;
            
            setCurrentWorkspace(targetWorkspace);
            if (targetWorkspace) {
                localStorage.setItem('lastWorkspaceId', targetWorkspace.id);
            }
        } catch (err) {
            console.error('Error loading workspaces:', err);
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const selectWorkspace = (workspaceId) => {
        const workspace = workspaces.find(w => w.id === workspaceId);
        if (workspace) {
            setCurrentWorkspace(workspace);
            localStorage.setItem('lastWorkspaceId', workspace.id);
        }
    };

    const createWorkspace = async (name, description, logo, currency) => {
        try {
            const response = await fetch('/api/workspaces', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    description,
                    logo,
                    currency,
                    userId: user.id
                })
            });

            if (!response.ok) throw new Error('Failed to create workspace');
            
            const newWorkspace = await response.json();
            setWorkspaces([...workspaces, newWorkspace]);
            setCurrentWorkspace(newWorkspace);
            return newWorkspace;
        } catch (err) {
            console.error('Error creating workspace:', err);
            throw err;
        }
    };

    const value = {
        workspaces,
        currentWorkspace,
        isLoading,
        error,
        selectWorkspace,
        createWorkspace,
        refreshWorkspaces: fetchWorkspaces
    };

    return (
        <WorkspaceContext.Provider value={value}>
            {children}
        </WorkspaceContext.Provider>
    );
};
