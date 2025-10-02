import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as Dialog from '@radix-ui/react-dialog'
import { Calendar, Copy, Check, X, Smartphone, Monitor, Globe } from 'lucide-react'

export default function CalendarSubscription({ userId, userName, trigger }) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const [open, setOpen] = useState(false)

  const isProduction = window.location.hostname === 'todo.rauwers.cloud'
  const baseUrl = isProduction ? 'https://todo.rauwers.cloud' : window.location.origin
  const subscribeUrl = `${baseUrl}/api/ical/user/${userId}/subscribe.ics`
  const webcalUrl = subscribeUrl.replace(/^https?:/, 'webcal:')

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(subscribeUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleQuickSubscribe = () => {
    if (isProduction) {
      window.location.href = webcalUrl
    } else {
      const link = document.createElement('a')
      link.href = subscribeUrl
      link.download = `tasks-${userName}.ics`
      link.click()
    }
    setOpen(false)
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        {trigger || (
          <button
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={t('calendar.subscribe')}
          >
            <Calendar size={20} className="text-gray-600 dark:text-gray-400" />
          </button>
        )}
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden z-50">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <Calendar className="text-blue-600 dark:text-blue-400" size={24} />
              <Dialog.Title className="text-xl font-semibold text-gray-900 dark:text-white">
                {t('calendar.subscribe')}
              </Dialog.Title>
            </div>
            <Dialog.Close asChild>
              <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors">
                <X size={20} className="text-gray-600 dark:text-gray-400" />
              </button>
            </Dialog.Close>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            <p className="text-gray-600 dark:text-gray-400">
              {t('calendar.instructions')}
            </p>

            {/* Quick Subscribe Button */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <button
                onClick={handleQuickSubscribe}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Calendar size={20} />
                {isProduction ? t('calendar.subscribe') : t('calendar.downloadICS')}
              </button>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-2 text-center">
                {isProduction
                  ? t('calendar.subscribeURL')
                  : 'Local mode: Download file for manual import'}
              </p>
            </div>

            {/* Subscription URL */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t('calendar.subscribeURL')}
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={subscribeUrl}
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white font-mono"
                />
                <button
                  onClick={handleCopyUrl}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check size={16} className="text-green-600 dark:text-green-400" />
                      {t('calendar.urlCopied')}
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      {t('calendar.copyURL')}
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Platform Instructions */}
            <div className="space-y-4">
              {/* Google Calendar */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                  <Globe size={18} />
                  Google Calendar
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400 pl-6">
                  <li>Open Google Calendar</li>
                  <li>Click the + next to "Other calendars"</li>
                  <li>Select "From URL"</li>
                  <li>Paste the subscription URL above</li>
                  <li>Click "Add calendar"</li>
                </ol>
              </div>

              {/* Apple Calendar */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                  <Smartphone size={18} />
                  Apple Calendar (iPhone/iPad/Mac)
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400 pl-6">
                  <li>Click "Quick Subscribe" button above</li>
                  <li>Calendar app opens automatically</li>
                  <li>Confirm to add the subscription</li>
                  <li>Your tasks will sync automatically</li>
                </ol>
              </div>

              {/* Outlook */}
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-2">
                  <Monitor size={18} />
                  Outlook (Desktop)
                </h4>
                <ol className="list-decimal list-inside space-y-1 text-sm text-gray-600 dark:text-gray-400 pl-6">
                  <li>Go to Calendar view</li>
                  <li>Click "Add Calendar" → "From Internet"</li>
                  <li>Paste the subscription URL</li>
                  <li>Click OK to subscribe</li>
                </ol>
              </div>
            </div>

            {/* Tip */}
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>💡 Tip:</strong> The subscription updates automatically. Any task changes will be synced to your calendar!
              </p>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
