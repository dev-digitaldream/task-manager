/**
 * FlowSpaces - Main Application
 *
 * Professional collaborative task management with real-time sync
 *
 * @copyright 2025 Digital Dream (www.digitaldream.work)
 * @license MIT
 */

import './i18n'
import React, { useState, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import LoginForm from './components/LoginForm'
import AppLayout from './components/AppLayout'
import ModernDashboard from './components/ModernDashboard'
import ExpensesPage from './components/ExpensesPage'
import MyPagesPage from './components/MyPagesPage'
import DraftsPage from './components/DraftsPage'
import ProfilePage from './components/ProfilePage'
import DashboardPage from './components/DashboardPage'
import TeamPage from './components/TeamPage'
import WikiPage from './components/WikiPage'
import ForgotPasswordPage from './components/ForgotPasswordPage'
import WorkspaceSettings from './components/WorkspaceSettings'
import AcceptInvitationPage from './components/AcceptInvitationPage'
import PostItBoard from './components/PostItBoard'
import { WorkspaceProvider } from './context/WorkspaceContext'
import { SearchProvider } from './context/SearchContext' // Import added

// Login Page Component - defined outside App to prevent recreation on each render
const LoginPage = ({ onLogin }) => {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('flowspaces_darkmode') === 'true')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('flowspaces_darkmode', darkMode)
  }, [darkMode])

  return (
    <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-[#0d1117]' : 'bg-[#faf9f7]'}`}>
      <LoginForm
        onLogin={onLogin}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(!darkMode)}
      />
    </div>
  )
}

// Protected Route wrapper with AppLayout for pages that need it
const ProtectedPage = ({ children, currentUser }) => {
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }
  return (
    <WorkspaceProvider user={currentUser}>
      <SearchProvider currentUser={currentUser}>
        <AppLayout currentUser={currentUser}>
          {children}
        </AppLayout>
      </SearchProvider>
    </WorkspaceProvider>
  )
}

// Simple protected route (for pages with their own layout like ModernDashboard)
const ProtectedRoute = ({ children, currentUser }) => {
  if (!currentUser) {
    return <Navigate to="/login" replace />
  }
  return (
    <WorkspaceProvider user={currentUser}>
      <SearchProvider currentUser={currentUser}>
        {children}
      </SearchProvider>
    </WorkspaceProvider>
  )
}

function App() {
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('currentUser')
    return saved ? JSON.parse(saved) : null
  })

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('currentUser', JSON.stringify(currentUser))
    }
  }, [currentUser])

  // Validate stored user against server
  useEffect(() => {
    const validateUser = async () => {
      try {
        if (!currentUser?.id) return
        const res = await fetch(`/api/users/${currentUser.id}`)
        if (!res.ok) {
          setCurrentUser(null)
          localStorage.removeItem('currentUser')
        } else {
          const userData = await res.json()
          if (userData.isAdmin !== currentUser.isAdmin) {
            setCurrentUser({ ...currentUser, isAdmin: userData.isAdmin })
          }
        }
      } catch (e) {
        console.debug('User validation skipped due to network error')
      }
    }
    validateUser()
  }, [currentUser?.id])

  const handleLogin = (user) => {
    setCurrentUser(user)
  }

  const handleLogout = () => {
    setCurrentUser(null)
    localStorage.removeItem('currentUser')
  }

  return (
    <Routes>
      {/* Default: redirect to modern dashboard */}
      <Route path="/" element={<Navigate to="/modern" replace />} />

      {/* Login */}
      <Route path="/login" element={
        currentUser ? <Navigate to="/modern" replace /> : <LoginPage onLogin={handleLogin} />
      } />

      {/* Forgot Password / Reset Password */}
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ForgotPasswordPage />} />

      {/* Invitations */}
      <Route path="/invite/:token" element={<AcceptInvitationPage currentUser={currentUser} />} />

      {/* ModernDashboard has its own full layout */}
      <Route path="/modern" element={
        <ProtectedRoute currentUser={currentUser}>
          <ModernDashboard currentUser={currentUser} />
        </ProtectedRoute>
      } />

      <Route path="/workspaces/:id" element={
        <ProtectedPage currentUser={currentUser}>
          <WorkspaceSettings />
        </ProtectedPage>
      } />

      {/* Post-it Board - standalone without AppLayout */}
      <Route path="/board" element={
        <ProtectedRoute currentUser={currentUser}>
          <PostItBoard currentUser={currentUser} />
        </ProtectedRoute>
      } />

      {/* Other pages use AppLayout */}
      <Route path="/expenses" element={
        <ProtectedPage currentUser={currentUser}>
          <div className="p-6">
            <ExpensesPage currentUser={currentUser} />
          </div>
        </ProtectedPage>
      } />

      <Route path="/my-pages" element={
        <ProtectedPage currentUser={currentUser}>
          <div className="p-6">
            <MyPagesPage currentUser={currentUser} />
          </div>
        </ProtectedPage>
      } />

      <Route path="/drafts" element={
        <ProtectedPage currentUser={currentUser}>
          <div className="p-6">
            <DraftsPage currentUser={currentUser} />
          </div>
        </ProtectedPage>
      } />

      <Route path="/profile" element={
        <ProtectedPage currentUser={currentUser}>
          <div className="p-6">
            <ProfilePage
              currentUser={currentUser}
              onLogout={handleLogout}
              onUpdate={(updated) => setCurrentUser({ ...currentUser, ...updated })}
            />
          </div>
        </ProtectedPage>
      } />

      <Route path="/dashboard-general" element={
        <ProtectedPage currentUser={currentUser}>
          <div className="p-6">
            <DashboardPage currentUser={currentUser} />
          </div>
        </ProtectedPage>
      } />

      <Route path="/team" element={
        <ProtectedPage currentUser={currentUser}>
          <div className="p-6">
            <TeamPage currentUser={currentUser} />
          </div>
        </ProtectedPage>
      } />

      <Route path="/wiki" element={
        <ProtectedPage currentUser={currentUser}>
          <div className="p-6">
            <WikiPage currentUser={currentUser} />
          </div>
        </ProtectedPage>
      } />

      <Route path="/calendar" element={
        <ProtectedPage currentUser={currentUser}>
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Calendar</h1>
            <p className="text-gray-500 mt-2">Coming soon...</p>
          </div>
        </ProtectedPage>
      } />
    </Routes>
  )
}

export default App