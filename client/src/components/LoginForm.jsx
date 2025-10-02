import React, { useState } from 'react'
import { LogIn, UserPlus, Eye, EyeOff, Moon, Sun } from 'lucide-react'

const LoginForm = ({ onLogin, darkMode, onToggleDarkMode }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    avatar: '👤'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const avatarOptions = ['👤', '👩‍💻', '👨‍💼', '👨‍🎨', '👩‍🔬', '👩‍🎓', '🧑‍💻', '👨‍🔧', '👩‍🍳', '🧑‍🎨']

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!formData.name.trim() || !formData.password) {
      setError('Nom et mot de passe requis')
      return
    }

    setIsLoading(true)

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur de connexion')
      }

      onLogin(data.user)
    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 w-full max-w-md mx-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isLogin ? 'Connexion' : 'Créer un compte'}
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

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nom d'utilisateur
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Entrez votre nom"
            disabled={isLoading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Mot de passe
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Entrez votre mot de passe"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {!isLogin && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Avatar
            </label>
            <div className="grid grid-cols-5 gap-2">
              {avatarOptions.map((avatar) => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => setFormData({ ...formData, avatar })}
                  className={`p-2 rounded-lg text-2xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                    formData.avatar === avatar 
                      ? 'bg-blue-100 dark:bg-blue-900 ring-2 ring-blue-500' 
                      : ''
                  }`}
                  disabled={isLoading}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && (
          <div className="text-red-600 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading || !formData.name.trim() || !formData.password}
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg transition-colors"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              {isLogin ? <LogIn size={20} /> : <UserPlus size={20} />}
              {isLogin ? 'Se connecter' : 'Créer le compte'}
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => {
            setIsLogin(!isLogin)
            setError('')
            setFormData({ name: '', password: '', avatar: '👤' })
          }}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm"
          disabled={isLoading}
        >
          {isLogin 
            ? "Pas encore de compte ? Créer un compte" 
            : "Déjà un compte ? Se connecter"
          }
        </button>
      </div>

    </div>
  )
}

export default LoginForm