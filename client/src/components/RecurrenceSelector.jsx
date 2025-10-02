import React from 'react'
import { Repeat } from 'lucide-react'

const RecurrenceSelector = ({ isRecurring, recurrencePattern, onChange }) => {
  const patterns = [
    { value: 'none', label: 'Pas de récurrence' },
    { value: 'daily', label: 'Tous les jours' },
    { value: 'weekdays', label: 'Jours ouvrables (Lun-Ven)' },
    { value: 'weekly', label: 'Toutes les semaines' },
    { value: 'biweekly', label: 'Toutes les 2 semaines' },
    { value: 'monthly', label: 'Tous les mois' },
    { value: 'yearly', label: 'Tous les ans' }
  ]

  const handleChange = (e) => {
    const value = e.target.value
    onChange({
      isRecurring: value !== 'none',
      recurrencePattern: value !== 'none' ? value : null
    })
  }

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
        <Repeat size={16} />
        Récurrence
      </label>

      <select
        value={isRecurring ? recurrencePattern || 'weekly' : 'none'}
        onChange={handleChange}
        className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
      >
        {patterns.map(pattern => (
          <option key={pattern.value} value={pattern.value}>
            {pattern.label}
          </option>
        ))}
      </select>

      {isRecurring && (
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Cette tâche sera automatiquement créée selon la récurrence choisie
        </p>
      )}
    </div>
  )
}

export default RecurrenceSelector
