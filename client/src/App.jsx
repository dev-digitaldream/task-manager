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
import { Routes, Route, Navigate } from 'react-router-dom'
import { Moon, Sun, Users, Download, FileText, Calendar, Settings, LogOut, Circle, RefreshCw, CheckCircle, Shield, Bell } from 'lucide-react'
import TaskList from './components/TaskListClean'
import Dashboard from './components/DashboardClean'
import MeetingMode from './components/MeetingMode'
import Analytics from './components/Analytics'
import LoginForm from './components/LoginForm'
import UserManagement from './components/UserManagement'
import CalendarModal from './components/CalendarModal'
import AdminPanel from './components/AdminPanel'
import UserSettings from './components/UserSettings'
import { useSocket } from './hooks/useSocket'
import { useTasks } from './hooks/useTasks'
import { useUsers } from './hooks/useUsers'

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true'
  })
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser')
    return saved ? JSON.parse(saved) : null
  })
  const [showUserManagement, setShowUserManagement] = useState(false)
  const [showCalendarModal, setShowCalendarModal] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [showUserSettings, setShowUserSettings] = useState(false)

  const { socket } = useSocket(currentUser?.id)
  const { tasks, createTask, updateTask, deleteTask, addComment, setTaskVisibility } = useTasks(socket)
  const { users, onlineUsers } = useUsers(socket)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

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

  const toggleDarkMode = () => {
    setDarkMode(!darkMode)
  }

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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Routes>
        {/* Default: redirect to public dashboard */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="/meeting" element={<MeetingMode />} />

        <Route path="/analytics" element={<Analytics />} />

        <Route path="/app" element={
          currentUser ? (
          <div className="container mx-auto px-4 py-6 max-w-4xl">
            <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
              <div className="flex items-center gap-6">
                <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
                  Task Manager
                </h1>
                
                {/* Minimalist stats badges */}
                <div className="flex items-center gap-2">
                  {/* Online users */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <Users size={14} className="text-gray-500 dark:text-gray-400" />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{onlineUsers.length}</span>
                  </div>

                  {/* Task counts - minimalist dots with numbers */}
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-1" title="To Do">
                      <div className="w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-500"></div>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{taskCounts.todo}</span>
                    </div>
                    <div className="w-px h-3 bg-gray-300 dark:bg-gray-600"></div>
                    <div className="flex items-center gap-1" title="In Progress">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{taskCounts.doing}</span>
                    </div>
                    <div className="w-px h-3 bg-gray-300 dark:bg-gray-600"></div>
                    <div className="flex items-center gap-1" title="Completed">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{taskCounts.done}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5">

                <button
                  onClick={() => setShowCalendarModal(true)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Subscribe to calendar (iPhone/Outlook)"
                >
                  <Calendar size={20} className="text-gray-600 dark:text-gray-400" />
                </button>

                <button
                  onClick={exportCSV}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Export to CSV"
                >
                  <FileText size={20} className="text-gray-600 dark:text-gray-400" />
                </button>

                <button
                  onClick={exportData}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Export to JSON"
                >
                  <Download size={20} className="text-gray-600 dark:text-gray-400" />
                </button>

                <button
                  onClick={() => setShowUserManagement(true)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="User Management"
                >
                  <Settings size={20} className="text-gray-600 dark:text-gray-400" />
                </button>

                <button
                  onClick={() => setShowUserSettings(true)}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title="Notifications and Settings"
                >
                  <Bell size={20} className="text-gray-600 dark:text-gray-400" />
                </button>

                {currentUser?.isAdmin && (
                  <button
                    onClick={() => setShowAdminPanel(true)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    title="Administration"
                  >
                    <Shield size={20} className="text-gray-600 dark:text-gray-400" />
                  </button>
                )}

                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {darkMode ? (
                    <Sun size={20} className="text-yellow-500" />
                  ) : (
                    <Moon size={20} className="text-gray-600" />
                  )}
                </button>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </header>

            <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-gray-900 dark:text-white">
                  Logged in as:
                </span>
                <span className="font-semibold text-blue-600 dark:text-blue-400">
                  {currentUser.avatar} {currentUser.name}
                </span>
              </div>
              
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span>Online users:</span>
                <div className="flex gap-1">
                  {onlineUsers.map(user => (
                    <span key={user.id} className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-xs">
                      {user.avatar} {user.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <TaskList
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

        {/* Public login route: redirect to /app if already authenticated */}
        <Route path="/login" element={
          currentUser ? (
            <Navigate to="/app" replace />
          ) : (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
              <LoginForm 
                onLogin={handleLogin}
                darkMode={darkMode}
                onToggleDarkMode={toggleDarkMode}
              />
            </div>
          )
        } />
      </Routes>

      {showUserManagement && (
        <UserManagement
          currentUser={currentUser}
          onClose={() => setShowUserManagement(false)}
        />
      )}

      {showCalendarModal && currentUser && (
        <CalendarModal
          userId={currentUser.id}
          userName={currentUser.name}
          onClose={() => setShowCalendarModal(false)}
        />
      )}

      {showAdminPanel && currentUser?.isAdmin && (
        <AdminPanel
          currentUser={currentUser}
          onClose={() => setShowAdminPanel(false)}
        />
      )}

      {showUserSettings && currentUser && (
        <UserSettings
          user={currentUser}
          onClose={() => setShowUserSettings(false)}
          onUpdate={(updatedUser) => {
            setCurrentUser({ ...currentUser, ...updatedUser })
          }}
        />
      )}
    </div>
  )
}

export default App