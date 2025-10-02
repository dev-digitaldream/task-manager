/**
 * Footer Component
 * 
 * @copyright 2025 Digital Dream (www.digitaldream.work)
 * @license MIT
 */

import React from 'react'

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 mt-auto">
      <div className="container mx-auto px-4 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-2 text-sm text-gray-600 dark:text-gray-400">
          <div>
            <span>Made with ❤️ by </span>
            <a 
              href="https://www.digitaldream.work" 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-medium text-gray-900 dark:text-white hover:underline"
            >
              Digital Dream
            </a>
          </div>
          
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com/digitaldream-work/task-manager" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              GitHub
            </a>
            <a 
              href="/docs" 
              className="hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Docs
            </a>
            <span className="text-gray-400 dark:text-gray-600">
              v1.0.0
            </span>
          </div>
          
          <div className="text-xs">
            © {currentYear} Digital Dream. Open Source (MIT)
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer
