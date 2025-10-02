import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import * as Separator from '@radix-ui/react-separator'
import { User, Settings, Bell, Globe, Palette, Mail } from 'lucide-react'
import LanguageSwitcher from './LanguageSwitcher'
import ThemeSwitcher from './ThemeSwitcher'

export default function UserProfile({ user, onUpdate }) {
  const { t } = useTranslation()
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem(`notifications-${user.id}`)
    return saved ? JSON.parse(saved) : {
      emailOnAssign: true,
      emailOnComplete: false,
      emailOnComment: true
    }
  })

  const handleNotificationToggle = (key) => {
    const updated = { ...notifications, [key]: !notifications[key] }
    setNotifications(updated)
    localStorage.setItem(`notifications-${user.id}`, JSON.stringify(updated))
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger asChild>
        <button
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title={t('profile.settings')}
        >
          <span className="text-lg">{user.avatar}</span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {user.name}
          </span>
        </button>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          className="min-w-[280px] bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 z-50"
          sideOffset={5}
          align="end"
        >
          {/* User Info */}
          <div className="px-3 py-2 mb-2">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{user.avatar}</span>
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  {user.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {user.email || t('auth.demoMode')}
                </div>
              </div>
            </div>
          </div>

          <Separator.Root className="h-px bg-gray-200 dark:bg-gray-700 my-2" />

          {/* Language Section */}
          <div className="px-3 py-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              <Globe size={12} />
              {t('profile.language')}
            </div>
            <div className="pl-5">
              <LanguageSwitcher />
            </div>
          </div>

          <Separator.Root className="h-px bg-gray-200 dark:bg-gray-700 my-2" />

          {/* Theme Section */}
          <div className="px-3 py-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              <Palette size={12} />
              {t('profile.theme')}
            </div>
            <div className="pl-5">
              <ThemeSwitcher />
            </div>
          </div>

          <Separator.Root className="h-px bg-gray-200 dark:bg-gray-700 my-2" />

          {/* Notification Preferences */}
          <div className="px-3 py-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              <Bell size={12} />
              {t('profile.notifications')}
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.emailOnAssign}
                  onChange={() => handleNotificationToggle('emailOnAssign')}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t('profile.notifyOnAssign')}
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.emailOnComplete}
                  onChange={() => handleNotificationToggle('emailOnComplete')}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t('profile.notifyOnComplete')}
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.emailOnComment}
                  onChange={() => handleNotificationToggle('emailOnComment')}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {t('profile.notifyOnComment')}
                </span>
              </label>
            </div>
          </div>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  )
}
