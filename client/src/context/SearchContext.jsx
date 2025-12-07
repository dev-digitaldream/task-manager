import React, { createContext, useContext, useState, useEffect } from 'react';
import SearchModal from '../components/SearchModal';
import { useTasks } from '../hooks/useTasks';
import { useSocket } from '../hooks/useSocket';
import { useWorkspace } from './WorkspaceContext';

const SearchContext = createContext();

export const useSearch = () => useContext(SearchContext);

export const SearchProvider = ({ children, currentUser }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    // We fetch tasks here so the modal has data regardless of which page we are on.
    // However, for performance, we might only want to fetch when modal is open?
    // But useTasks connects websockets, so we might want it persistent?
    // Let's rely on useTasks to be smart.
    
    const { currentWorkspace } = useWorkspace();
    const { socket } = useSocket(currentUser?.id);
    const { tasks } = useTasks(socket, currentWorkspace?.id); // Used for search results

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(true);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const openSearch = () => setIsOpen(true);
    const closeSearch = () => setIsOpen(false);

    return (
        <SearchContext.Provider value={{ isOpen, openSearch, closeSearch }}>
            {children}
            {currentUser && (
                <SearchModal 
                    isOpen={isOpen} 
                    onClose={closeSearch} 
                    tasks={tasks} // Pass global tasks to search modal
                    onTaskClick={() => {
                        closeSearch();
                        // Navigation handled inside SearchModal usually?
                    }}
                />
            )}
        </SearchContext.Provider>
    );
};
