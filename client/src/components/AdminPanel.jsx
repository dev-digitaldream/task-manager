import React, { useState, useEffect } from 'react'
import { UserPlus, Trash2, Shield, X } from 'lucide-react'

const AdminPanel = ({ onClose, currentUser }) => {
  const [users, setUsers] = useState([])
  const [newUserForm, setNewUserForm] = useState({
    name: '',
    avatar: '👤',
    isAdmin: false
  })
  const [showCreateForm, setShowCreateForm] = useState(false)

  const availableEmojis = ['👨', '👩', '🧑', '👤', '🙋', '🙋‍♂️', '🙋‍♀️', '🧔', '👨‍💼', '👩‍💼', '👷', '👨‍🔧', '👩‍🔧', '🧑‍💻', '👨‍🎨', '👩‍🎨']

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users')
      const data = await response.json()
      setUsers(data)
    } catch (error) {
      console.error('Failed to fetch users:', error)
    }
  }

  const handleCreateUser = async (e) => {
    e.preventDefault()
    if (!newUserForm.name.trim()) return

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newUserForm.name.trim(),
          avatar: newUserForm.avatar,
          isAdmin: newUserForm.isAdmin
        })
      })

      if (response.ok) {
        setNewUserForm({ name: '', avatar: '👤', isAdmin: false })
        setShowCreateForm(false)
        fetchUsers()
      }
    } catch (error) {
      console.error('Failed to create user:', error)
    }
  }

  const handleDeleteUser = async (userId) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        fetchUsers()
      }
    } catch (error) {
      console.error('Failed to delete user:', error)
    }
  }

  const handleToggleAdmin = async (userId, currentIsAdmin) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/admin`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isAdmin: !currentIsAdmin })
      })

      if (response.ok) {
        fetchUsers()
      }
    } catch (error) {
      console.error('Failed to toggle admin:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-slate-700 dark:text-slate-300" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
              Administration des utilisateurs
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
          >
            <X className="h-5 w-5 text-slate-500 dark:text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Create User Button */}
          {!showCreateForm && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-md transition-colors"
            >
              <UserPlus size={18} />
              Créer un nouvel utilisateur
            </button>
          )}

          {/* Create User Form */}
          {showCreateForm && (
            <form onSubmit={handleCreateUser} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 space-y-4">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                Nouvel utilisateur
              </h3>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Nom
                </label>
                <input
                  type="text"
                  value={newUserForm.name}
                  onChange={(e) => setNewUserForm({ ...newUserForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md text-slate-900 dark:text-slate-50 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-400 dark:focus:ring-slate-600"
                  placeholder="Nom de l'utilisateur"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Avatar
                </label>
                <div className="grid grid-cols-8 gap-2">
                  {availableEmojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setNewUserForm({ ...newUserForm, avatar: emoji })}
                      className={`p-2 text-2xl rounded-md transition-colors ${
                        newUserForm.avatar === emoji
                          ? 'bg-slate-900 dark:bg-slate-50'
                          : 'bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isAdmin"
                  checked={newUserForm.isAdmin}
                  onChange={(e) => setNewUserForm({ ...newUserForm, isAdmin: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300 dark:border-slate-700"
                />
                <label htmlFor="isAdmin" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  Administrateur
                </label>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false)
                    setNewUserForm({ name: '', avatar: '👤', isAdmin: false })
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-sm font-medium text-slate-50 bg-slate-900 dark:bg-slate-50 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200 rounded-md transition-colors"
                >
                  Créer
                </button>
              </div>
            </form>
          )}

          {/* Users List */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 mb-3">
              Utilisateurs ({users.length})
            </h3>

            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{user.avatar}</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-slate-900 dark:text-slate-50">
                        {user.name}
                      </span>
                      {user.isAdmin && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium bg-slate-900 dark:bg-slate-50 text-slate-50 dark:text-slate-900 rounded">
                          <Shield size={12} />
                          Admin
                        </span>
                      )}
                      {user.id === currentUser?.id && (
                        <span className="text-xs text-slate-500 dark:text-slate-400">(vous)</span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {user._count?.assignedTasks || 0} tâches assignées
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {user.id !== currentUser?.id && (
                    <>
                      <button
                        onClick={() => handleToggleAdmin(user.id, user.isAdmin)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                          user.isAdmin
                            ? 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                            : 'text-slate-50 bg-slate-900 dark:bg-slate-50 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-200'
                        }`}
                        title={user.isAdmin ? 'Retirer admin' : 'Promouvoir admin'}
                      >
                        <Shield size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-50 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
                        title="Supprimer l'utilisateur"
                      >
                        <Trash2 size={16} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPanel
