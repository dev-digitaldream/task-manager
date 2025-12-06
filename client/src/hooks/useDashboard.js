import { useState, useEffect } from 'react';

/**
 * Hook pour récupérer les documents personnels de l'utilisateur
 * @param {number} userId - ID de l'utilisateur connecté
 * @returns {Array} Liste des documents privés
 */
export const usePersonalDocs = (userId) => {
    const [docs, setDocs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!userId) return;

        const fetchDocs = async () => {
            try {
                setLoading(true);
                // Pour l'instant, on utilise les tâches privées comme "documents"
                const response = await fetch(`/api/tasks?userId=${userId}&isPublic=false`);

                if (!response.ok) {
                    throw new Error('Failed to fetch personal docs');
                }

                const tasks = await response.json();

                // Transformer les tâches en format "document"
                const documents = tasks.map(task => ({
                    id: task.id,
                    title: task.title,
                    tag: task.status === 'done' ? 'Terminé' : task.status === 'doing' ? 'En cours' : 'Brouillon',
                    time: formatRelativeTime(task.updatedAt),
                    private: !task.isPublic,
                    views: 0,
                    comments: task.comments?.length || 0,
                }));

                setDocs(documents);
                setError(null);
            } catch (err) {
                console.error('Error fetching personal docs:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDocs();
    }, [userId]);

    return { docs, loading, error };
};

/**
 * Hook pour récupérer les statistiques de l'utilisateur
 * @param {number} userId - ID de l'utilisateur connecté
 * @returns {Object} Statistiques (tâches personnelles, mises à jour, etc.)
 */
export const useStats = (userId) => {
    const [stats, setStats] = useState({
        personalTasks: '0 en attente',
        teamUpdates: '0 nouvelles',
        docsReviewed: '0% complété',
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;

        const fetchStats = async () => {
            try {
                setLoading(true);
                const response = await fetch(`/api/tasks?userId=${userId}`);
                const tasks = await response.json();

                const personalPending = tasks.filter(t => t.status !== 'done').length;
                const totalTasks = tasks.length;
                const completedTasks = tasks.filter(t => t.status === 'done').length;
                const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

                setStats({
                    personalTasks: `${personalPending} en attente`,
                    teamUpdates: `${tasks.filter(t => t.isPublic).length} nouvelles`,
                    docsReviewed: `${completionRate}% complété`,
                });
            } catch (err) {
                console.error('Error fetching stats:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [userId]);

    return { stats, loading };
};

/**
 * Hook pour récupérer le flux d'activité de l'entreprise
 * @param {Object} socket - Instance Socket.io
 * @returns {Array} Liste des activités récentes
 */
export const useActivityFeed = (socket) => {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Récupérer les activités initiales (tâches publiques récentes)
        const fetchActivities = async () => {
            try {
                setLoading(true);
                const response = await fetch('/api/tasks?isPublic=true&limit=10');
                const tasks = await response.json();

                const activityItems = tasks.map(task => ({
                    user: task.owner?.name || task.user?.name || 'Utilisateur',
                    action: task.status === 'done' ? 'a terminé' : 'a publié',
                    target: task.title,
                    time: formatRelativeTime(task.updatedAt),
                    isAi: false,
                }));

                setActivities(activityItems);
            } catch (err) {
                console.error('Error fetching activities:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();

        // Écouter les nouvelles activités en temps réel via Socket.io
        if (socket) {
            socket.on('task:created', (task) => {
                if (task.isPublic) {
                    const newActivity = {
                        user: task.owner?.name || task.user?.name || 'Utilisateur',
                        action: 'a créé',
                        target: task.title,
                        time: 'À l\'instant',
                        isAi: false,
                    };
                    setActivities(prev => [newActivity, ...prev].slice(0, 10));
                }
            });

            socket.on('task:updated', (task) => {
                if (task.isPublic) {
                    const newActivity = {
                        user: task.owner?.name || task.user?.name || 'Utilisateur',
                        action: task.status === 'done' ? 'a terminé' : 'a mis à jour',
                        target: task.title,
                        time: 'À l\'instant',
                        isAi: false,
                    };
                    setActivities(prev => [newActivity, ...prev].slice(0, 10));
                }
            });

            socket.on('comment:added', ({ task, comment }) => {
                if (task.isPublic) {
                    const newActivity = {
                        user: comment.user?.name || 'Utilisateur',
                        action: 'a commenté sur',
                        target: task.title,
                        time: 'À l\'instant',
                        isAi: false,
                    };
                    setActivities(prev => [newActivity, ...prev].slice(0, 10));
                }
            });
        }

        return () => {
            if (socket) {
                socket.off('task:created');
                socket.off('task:updated');
                socket.off('comment:added');
            }
        };
    }, [socket]);

    return { activities, loading };
};

/**
 * Formater une date en temps relatif (ex: "Il y a 2h")
 * @param {string|Date} date - Date à formater
 * @returns {string} Temps relatif
 */
function formatRelativeTime(date) {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'À l\'instant';
    if (diffMins < 60) return `Il y a ${diffMins}min`;
    if (diffHours < 24) return `Il y a ${diffHours}h`;
    if (diffDays === 1) return 'Hier';
    if (diffDays < 7) return `Il y a ${diffDays}j`;
    return past.toLocaleDateString('fr-FR');
}
