/**
 * Widget Entry Point
 */
import './i18n'
import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import TaskWidget from './components/TaskWidget'
import './index.css'

function WidgetApp() {
  useEffect(() => {
    // Apply dark mode from localStorage
    const darkMode = localStorage.getItem('darkMode') === 'true'
    if (darkMode) {
      document.documentElement.classList.add('dark')
    }
  }, [])

  return <TaskWidget />
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <WidgetApp />
  </React.StrictMode>
)
