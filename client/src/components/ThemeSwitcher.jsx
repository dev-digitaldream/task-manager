import React, { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { Sun, Moon, Monitor } from 'lucide-react'

const themes = [
  { value: 'light', label: 'theme.light', icon: Sun },
  { value: 'dark', label: 'theme.dark', icon: Moon },
  { value: 'system', label: 'theme.system', icon: Monitor }
]

export default function ThemeSwitcher() {
  const { t } = useTranslation()
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme-preference') || 'system'
  })

  useEffect(() => {
    const applyTheme = (themeValue) => {
      const root = document.documentElement

      if (themeValue === 'system') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (systemPrefersDark) {
          root.classList.add('dark')
        } else {
          root.classList.remove('dark')
        }
      } else if (themeValue === 'dark') {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
    }

    applyTheme(theme)
    localStorage.setItem('theme-preference', theme)

    // Listen for system theme changes when in system mode
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => applyTheme('system')
      mediaQuery.addEventListener('change', handler)
      return () => mediaQuery.removeEventListener('change', handler)
    }
  }, [theme])

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme)
  }

  const currentTheme = themes.find(t => t.value === theme) || themes[2]
  const CurrentIcon = currentTheme.icon

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title={t('profile.theme')}
        >
          <CurrentIcon size={20} className={
            theme === 'dark' ? 'text-yellow-500' : 'text-gray-600 dark:text-gray-400'
          } />
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[180px] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1 z-50"
          sideOffset={5}
        >
          {themes.map((themeOption) => {
            const Icon = themeOption.icon
            return (
              <DropdownMenu.Item
                key={themeOption.value}
                onClick={() => handleThemeChange(themeOption.value)}
                className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer outline-none transition-colors ${
                  theme === themeOption.value
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}
              >
                <Icon size={16} />
                <span className="text-sm font-medium">{t(themeOption.label)}</span>
                {theme === themeOption.value && (
                  <span className="ml-auto text-blue-600 dark:text-blue-400">✓</span>
                )}
              </DropdownMenu.Item>
            )
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
