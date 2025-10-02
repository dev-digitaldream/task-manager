import React, { useState, useEffect } from 'react'
import { Edit, Save, X, Key, Users, Shield } from 'lucide-react'

const UserManagement = ({ currentUser, onClose }) => {
  const [users, setUsers] = useState([])
  const [editingUser, setEditingUser] = useState(null)
  const [editForm, setEditForm] = useState({ name: '', avatar: '' })
  const [passwordForm, setPasswordForm] = useState({
    userId: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswordForm, setShowPasswordForm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const avatarOptions = ['👤', '👩‍💻', '👨‍💼', '👨‍🎨', '👩‍🔬', '👩‍🎓', '🧑‍💻', '👨‍🔧', '👩‍🍳', '🧑‍🎨']

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/auth/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Error fetching users:', error)
    }
  }

  const handleEditUser = (user) => {
    setEditingUser(user.id)
    setEditForm({ name: user.name, avatar: user.avatar })
    setError('')
    setSuccess('')
  }

  const handleSaveUser = async (userId) => {
    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch(`/api/auth/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de la mise à jour')
      }

      setUsers(users.map(user => 
        user.id === userId ? { ...user, ...data } : user
      ))
      setEditingUser(null)
      setSuccess('Utilisateur mis à jour avec succès')
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setEditingUser(null)
    setEditForm({ name: '', avatar: '' })
    setError('')
  }

  const handlePasswordChange = async (e) => {
    e.preventDefault()
    setError('')

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (passwordForm.newPassword.length < 3) {
      setError('Le mot de passe doit contenir au moins 3 caractères')
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: passwordForm.userId,
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du changement de mot de passe')
      }

      setSuccess('Mot de passe mis à jour avec succès')
      setShowPasswordForm(false)
      setPasswordForm({
        userId: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
      setTimeout(() => setSuccess(''), 3000)
    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const openPasswordForm = (userId) => {
    setPasswordForm({
      userId,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
    setShowPasswordForm(true)
    setError('')
    setSuccess('')
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <Shield className="text-blue-600 dark:text-blue-400" size={24} />
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Gestion des utilisateurs
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 text-green-600 dark:text-green-400 text-sm bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              {success}
            </div>
          )}

          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {editingUser === user.id ? (
                      <div className="flex items-center gap-3">
                        <select
                          value={editForm.avatar}
                          onChange={(e) => setEditForm({ ...editForm, avatar: e.target.value })}
                          className="text-2xl bg-transparent border-none focus:outline-none"
                          disabled={isLoading}
                        >
                          {avatarOptions.map(avatar => (
                            <option key={avatar} value={avatar}>{avatar}</option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          disabled={isLoading}
                        />
                      </div>
                    ) : (
                      <>
                        <span className="text-2xl">{user.avatar}</span>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            {user.name}
                            {user.id === currentUser?.id && (
                              <span className="ml-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20 px-2 py-1 rounded-full">
                                Vous
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">
                            {user.isOnline && (
                              <span className="text-green-600 dark:text-green-400">● En ligne</span>
                            )}
                            {!user.isOnline && <span>Hors ligne</span>}
                            <span className="ml-2">
                              {user._count?.tasks || 0} tâche(s) active(s)
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {editingUser === user.id ? (
                      <>
                        <button
                          onClick={() => handleSaveUser(user.id)}
                          disabled={isLoading || !editForm.name.trim()}
                          className="p-2 text-green-600 hover:text-green-800 dark:text-green-400 dark:hover:text-green-300 disabled:opacity-50"
                        >
                          <Save size={16} />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          disabled={isLoading}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <X size={16} />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditUser(user)}
                          className="p-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Modifier l'utilisateur"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => openPasswordForm(user.id)}
                          className="p-2 text-orange-600 hover:text-orange-800 dark:text-orange-400 dark:hover:text-orange-300"
                          title="Changer le mot de passe"
                        >
                          <Key size={16} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {showPasswordForm && (
            <div className="mt-6 border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-700/50">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Key size={16} />
                Changer le mot de passe
              </h3>
              
              <form onSubmit={handlePasswordChange} className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Mot de passe actuel
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Mot de passe actuel (optionnel si pas de mot de passe)"
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Nouveau mot de passe"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="Confirmer le nouveau mot de passe"
                    disabled={isLoading}
                    required
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    disabled={isLoading || !passwordForm.newPassword || !passwordForm.confirmPassword}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition-colors"
                  >
                    {isLoading ? 'Mise à jour...' : 'Changer le mot de passe'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPasswordForm(false)}
                    disabled={isLoading}
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default UserManagement