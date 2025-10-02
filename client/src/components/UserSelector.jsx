import React, { useState } from 'react'
import { Moon, Sun, Plus, Users } from 'lucide-react'
import { useUsers } from '../hooks/useUsers'

const UserSelector = ({ users, onUserSelect, darkMode, onToggleDarkMode }) => {
  const [showNewUserForm, setShowNewUserForm] = useState(false)
  const [newUserName, setNewUserName] = useState('')
  const [selectedAvatar, setSelectedAvatar] = useState('👤')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState('')

  const { createUser } = useUsers()

  const avatarOptions = ['👤', '👩‍💻', '👨‍💼', '👨‍🎨', '👩‍🔬', '👩‍🎓', '🧑‍💻', '👨‍🔧', '👩‍🍳', '🧑‍🎨']

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!newUserName.trim()) {
      setError('Le nom est obligatoire')
      return
    }

    setIsCreating(true)
    
    try {
      const user = await createUser({
        name: newUserName.trim(),
        avatar: selectedAvatar
      })
      
      onUserSelect(user)
    } catch (error) {
      setError(error.message)
    } finally {
      setIsCreating(false)
    }
  }

  const resetForm = () => {
    setNewUserName('')
    setSelectedAvatar('👤')
    setError('')
    setShowNewUserForm(false)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 w-full max-w-md mx-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Sélection utilisateur
        </h2>
        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {darkMode ? (
            <Sun size={20} className="text-yellow-500" />
          ) : (
            <Moon size={20} className="text-gray-600" />
          )}
        </button>
      </div>

      {users.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Users size={16} className="text-gray-600 dark:text-gray-400" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Utilisateurs existants
            </h3>
          </div>
          
          <div className="space-y-2">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => onUserSelect(user)}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <span className="text-2xl">{user.avatar}</span>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900 dark:text-white">
                    {user.name}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {user._count?.tasks || 0} tâche(s) active(s)
                    {user.isOnline && (
                      <span className="ml-2 text-green-600 dark:text-green-400">• En ligne</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {!showNewUserForm ? (
        <button
          onClick={() => setShowNewUserForm(true)}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
        >
          <Plus size={20} />
          <span>
            Créer un nouvel utilisateur
          </span>
        </button>
      ) : (
        <form onSubmit={handleCreateUser} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Entrez votre nom"
              disabled={isCreating}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Avatar
            </label>
            <div className="grid grid-cols-5 gap-2">
              {avatarOptions.map((avatar) => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar)}
                  className={`p-2 rounded-lg text-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    selectedAvatar === avatar 
                      ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500' 
                      : ''
                  }`}
                  disabled={isCreating}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-2 rounded">
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isCreating || !newUserName.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition-colors"
            >
              {isCreating ? 'Création...' : 'Créer'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              disabled={isCreating}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
            >
              Annuler
            </button>
          </div>
        </form>
      )}
    </div>
  )
}

export default UserSelector