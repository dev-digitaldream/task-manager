/**
 * Task Manager - Main Application
 *
 * Professional collaborative task management with real-time sync
 *
 * @copyright 2025 Digital Dream (www.digitaldream.work)
 * @license MIT
 */

import './i18n'
import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate, Link } from 'react-router-dom'
import { Moon, Sun, Users, Download, FileText, Calendar, Settings, LogOut, Circle, RefreshCw, CheckCircle, Shield, Bell, X, LayoutGrid, Upload, Sparkles } from 'lucide-react'
import TaskList from './components/TaskList'
import KanbanBoard from './components/KanbanBoard'
import Dashboard from './components/Dashboard'
import MeetingMode from './components/MeetingMode'
import Analytics from './components/Analytics'
import LoginForm from './components/LoginForm'
import UserManagement from './components/UserManagement'
import CalendarSubscription from './components/CalendarSubscriptionSimple'
import AdminPanel from './components/AdminPanel'
import UserSettings from './components/UserSettings'
import UserProfile from './components/UserProfile'
import IntegrationsSettings from './components/IntegrationsSettingsSimple'
import TaskImport from './components/TaskImport'
import ThemeSwitcher from './components/ThemeSwitcher'
import LanguageSwitcher from './components/LanguageSwitcher'
import ModernDashboard from './components/ModernDashboard'
import ExpensesPage from './components/ExpensesPage'
import MyPagesPage from './components/MyPagesPage'
import DraftsPage from './components/DraftsPage'
import ProfilePage from './components/ProfilePage'
import DashboardPage from './components/DashboardPage'
import TeamPage from './components/TeamPage'
import WikiPage from './components/WikiPage'
import { useSocket } from './hooks/useSocket'
import { useTasks } from './hooks/useTasks'
import { useUsers } from './hooks/useUsers'

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser')
    return saved ? JSON.parse(saved) : null
  })
  const [showUserManagement, setShowUserManagement] = useState(false)
  const [showCalendarModal, setShowCalendarModal] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [showUserSettings, setShowUserSettings] = useState(false)
  const [showIntegrations, setShowIntegrations] = useState(false)
  const [showImport, setShowImport] = useState(false)

  const { socket } = useSocket(currentUser?.id)
  const { tasks, createTask, updateTask, deleteTask, addComment, setTaskVisibility } = useTasks(socket)
  const { users, onlineUsers } = useUsers(socket)

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser))
    }
  }, [currentUser])

  // Validate stored user against server to avoid stale IDs from previous databases
  useEffect(() => {
    const validateUser = async () => {
      try {
        if (!currentUser?.id) return
        const res = await fetch(`/api/users/${currentUser.id}`)
        if (!res.ok) {
          // User no longer exists -> clear session
          setCurrentUser(null)
          localStorage.removeItem('currentUser')
        } else {
          const userData = await res.json()
          // Update currentUser if isAdmin status changed
          if (userData.isAdmin !== currentUser.isAdmin) {
            setCurrentUser({ ...currentUser, isAdmin: userData.isAdmin })
          }
        }
      } catch (e) {
        // Network hiccups ignored; user will be revalidated later
        console.debug('User validation skipped due to network error')
      }
    }
    validateUser()
  }, [currentUser?.id])

  // Sync currentUser when users list is updated (to get isAdmin changes)
  useEffect(() => {
    if (!currentUser?.id || !users.length) return
    const updatedUser = users.find(u => u.id === currentUser.id)
    if (updatedUser && updatedUser.isAdmin !== currentUser.isAdmin) {
      setCurrentUser({ ...currentUser, isAdmin: updatedUser.isAdmin })
    }
  }, [users, currentUser])

  const exportData = async () => {
    try {
      const response = await fetch('/api/users/export')
      const data = await response.json()

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json'
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `todo-export-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Export failed:', error)
    }
  }

  const exportCSV = () => {
    try {
      // CSV header
      const headers = ['Title', 'Status', 'Priority', 'Assigned To', 'Owner', 'Due Date', 'Client Approval', 'Public', 'Created At']

      // CSV rows
      const rows = tasks.map(task => [
        `"${(task.title || '').replace(/"/g, '""')}"`,
        task.status || '',
        task.priority || 'medium',
        task.assignee ? `"${task.assignee.name}"` : '',
        task.owner ? `"${task.owner.name}"` : '',
        task.dueDate ? new Date(task.dueDate).toLocaleDateString('fr-FR') : '',
        task.clientApproval || 'none',
        task.isPublic ? 'Yes' : 'No',
        new Date(task.createdAt).toLocaleDateString('fr-FR')
      ])

      const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `tasks-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('CSV export failed:', error)
    }
  }

  const getTaskCounts = () => {
    return {
      todo: tasks.filter(t => t.status === 'todo').length,
      doing: tasks.filter(t => t.status === 'doing').length,
      done: tasks.filter(t => t.status === 'done').length
    }
  }

  const handleLogin = (user) => {
    setCurrentUser(user)
  }

  const handleLogout = () => {
    setCurrentUser(null)
    localStorage.removeItem('currentUser')
  }

  // Public dashboard: we no longer gate the whole app on login.
  const taskCounts = getTaskCounts()

  // LoginPage with local dark mode management
  const LoginPage = ({ onLogin }) => {
    const [darkMode, setDarkMode] = useState(() => {
      return localStorage.getItem('darkMode') === 'true'
    })

    useEffect(() => {
      if (darkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      localStorage.setItem('darkMode', darkMode)
    }, [darkMode])

    const toggleDarkMode = () => {
      setDarkMode(!darkMode)
    }

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoginForm
          onLogin={onLogin}
          darkMode={darkMode}
          onToggleDarkMode={toggleDarkMode}
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Routes>
        {/* Default: redirect to public dashboard */}
        <Route path="/" element={<Navigate to="/modern" replace />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/meeting" element={<MeetingMode />} />

        <Route path="/analytics" element={<Analytics />} />

        <Route path="/modern" element={
          currentUser ? (
            <ModernDashboard currentUser={currentUser} />
          ) : (
            <Navigate to="/login" replace />
          )
        } />

        <Route path="/expenses" element={
          currentUser ? (
            <ExpensesPage currentUser={currentUser} />
          ) : (
            <Navigate to="/login" replace />
          )
        } />

        <Route path="/my-pages" element={
          currentUser ? (
            <MyPagesPage currentUser={currentUser} />
          ) : (
            <Navigate to="/login" replace />
          )
        } />

        <Route path="/drafts" element={
          currentUser ? (
            <DraftsPage currentUser={currentUser} />
          ) : (
            <Navigate to="/login" replace />
          )
        } />

        <Route path="/profile" element={
          currentUser ? (
            <ProfilePage
              currentUser={currentUser}
              onLogout={handleLogout}
              onUpdate={(updated) => setCurrentUser({ ...currentUser, ...updated })}
            />
          ) : (
            <Navigate to="/login" replace />
          )
        } />

        <Route path="/dashboard-general" element={
          currentUser ? (
            <DashboardPage currentUser={currentUser} />
          ) : (
            <Navigate to="/login" replace />
          )
        } />

        <Route path="/team" element={
          currentUser ? (
            <TeamPage currentUser={currentUser} />
          ) : (
            <Navigate to="/login" replace />
          )
        } />

        <Route path="/wiki" element={
          currentUser ? (
            <WikiPage currentUser={currentUser} />
          ) : (
            <Navigate to="/login" replace />
          )
        } />

        <Route path="/kanban" element={
          currentUser ? (
            <div className="container mx-auto px-4 py-6">
              <header className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-6">
                  <Link to="/app" className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700" title="Vue Liste">
                    <FileText size={20} className="text-gray-600 dark:text-gray-400" />
                  </Link>
                  <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
                    Vue Kanban
                  </h1>
                </div>

                <div className="flex items-center gap-2">
                  <ThemeSwitcher />
                  <LanguageSwitcher />
                  <UserProfile user={currentUser} onUpdate={(updated) => setCurrentUser({ ...currentUser, ...updated })} />
                </div>
              </header>

              <KanbanBoard
                tasks={tasks}
                users={users}
                currentUser={currentUser}
                onCreateTask={createTask}
                onUpdateTask={updateTask}
                onDeleteTask={deleteTask}
                onAddComment={addComment}
                onSetVisibility={setTaskVisibility}
              />
            </div>
          ) : (
            <Navigate to="/login" replace />
          )
        } />

        {/* Public login route: redirect to /modern if already authenticated */}
        <Route path="/login" element={
          currentUser ? (
            <Navigate to="/modern" replace />
          ) : (
            <LoginPage onLogin={handleLogin} />
          )
        } />
      </Routes >

      {showUserManagement && (
        <UserManagement
          currentUser={currentUser}
          onClose={() => setShowUserManagement(false)}
        />
      )}

      {
        showCalendarModal && currentUser && (
          <CalendarSubscription
            userId={currentUser.id}
            userName={currentUser.name}
            onClose={() => setShowCalendarModal(false)}
          />
        )
      }

      {
        showAdminPanel && currentUser?.isAdmin && (
          <AdminPanel
            currentUser={currentUser}
            onClose={() => setShowAdminPanel(false)}
          />
        )
      }

      {
        showUserSettings && currentUser && (
          <UserSettings
            user={currentUser}
            onClose={() => setShowUserSettings(false)}
            onUpdate={(updatedUser) => {
              setCurrentUser({ ...currentUser, ...updatedUser })
            }}
          />
        )
      }

      {
        showIntegrations && currentUser && (
          <IntegrationsSettings
            userId={currentUser.id}
            onClose={() => setShowIntegrations(false)}
          />
        )
      }

      {
        showImport && currentUser && (
          <TaskImport
            currentUser={currentUser}
            onImport={() => {
              setShowImport(false)
              // Tasks will auto-refresh via socket
            }}
            onClose={() => setShowImport(false)}
          />
        )
      }
    </div >
  )
}

export default App