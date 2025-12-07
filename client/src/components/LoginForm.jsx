import React, { useState } from 'react'
import { LogIn, UserPlus, Eye, EyeOff, Moon, Sun, Sparkles, Github, Mail, Command } from 'lucide-react'

// Simple Google Icon component since Lucide doesn't have it
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

const LoginForm = ({ onLogin, darkMode, onToggleDarkMode }) => {
  const [isLogin, setIsLogin] = useState(true)
  const [useEmail, setUseEmail] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    avatar: '👤'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const theme = {
    bg: darkMode ? 'bg-[#191919]' : 'bg-white',
    text: darkMode ? 'text-[#D4D4D4]' : 'text-[#37352f]',
    textMuted: darkMode ? 'text-[#9B9B9B]' : 'text-[rgba(55,53,47,0.65)]',
    input: darkMode 
      ? 'bg-[#202020] border-[#373737] text-white placeholder-gray-500' 
      : 'bg-white border-[rgba(55,53,47,0.16)] text-[#37352f] placeholder-gray-400',
    button: darkMode 
      ? 'hover:bg-[#2C2C2C] border-[#373737]' 
      : 'hover:bg-[rgba(55,53,47,0.08)] border-[rgba(55,53,47,0.16)]',
    card: darkMode ? 'border-[#373737]' : 'border-transparent', // Minimalist
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    // Logic kept same as before
    if (useEmail) {
      if (!formData.email.trim() || !formData.password) {
        setError('Email and password required')
        return
      }
      if (!isLogin && !formData.name.trim()) {
        setError('Name required for registration')
        return
      }
    } else {
      if (!formData.name.trim()) {
        setError('Name required')
        return
      }
    }

    setIsLoading(true)

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
      const payload = useEmail 
        ? { email: formData.email, password: formData.password, name: formData.name, avatar: formData.avatar }
        : { name: formData.name, avatar: formData.avatar }
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Login failed')
      onLogin(data.user || data)
    } catch (error) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

  const handleSocialLogin = (provider) => {
    // Placeholder for real OAuth logic
    alert(`Connecting to ${provider}... (Configure OAuth in Settings)`);
  };

  return (
    <div className={`w-full max-w-[400px] mx-auto p-6 md:p-8 flex flex-col items-center animate-in fade-in duration-700 slide-in-from-bottom-4`}>
      {/* Header / Logo */}
      <div className="mb-8 text-center">
        <div className="mx-auto w-16 h-16 bg-white border border-gray-200 shadow-sm rounded-xl flex items-center justify-center mb-4 overflow-hidden">
             <div className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-tr from-violet-600 to-purple-500">
               F
             </div>
        </div>
        <h1 className={`text-2xl font-bold ${theme.text} mb-2 tracking-tight`}>
          {isLogin ? 'Log in to FlowSpaces' : 'Create your account'}
        </h1>
        <p className={`text-[15px] ${theme.textMuted}`}>
          Welcome back. Please enter your details.
        </p>
      </div>

      {/* Social Login Buttons */}
      <div className="w-full space-y-3 mb-6">
        <button 
          onClick={() => handleSocialLogin('Google')}
          className={`w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-transparent border rounded-[4px] font-medium text-[14px] transition-colors ${theme.button} ${theme.text} ${theme.input} border-[rgba(55,53,47,0.16)]`}
        >
          <GoogleIcon />
          <span>Continue with Google</span>
        </button>
        <button 
          onClick={() => handleSocialLogin('GitHub')}
          className={`w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-transparent border rounded-[4px] font-medium text-[14px] transition-colors ${theme.button} ${theme.text} ${theme.input} border-[rgba(55,53,47,0.16)]`}
        >
          <Github size={20} className={darkMode ? 'text-white' : 'text-black'} />
          <span>Continue with GitHub</span>
        </button>
         <button 
          onClick={() => handleSocialLogin('SSO')}
          className={`w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-transparent border rounded-[4px] font-medium text-[14px] transition-colors ${theme.button} ${theme.text} ${theme.input} border-[rgba(55,53,47,0.16)]`}
        >
          <Command size={18} className={theme.textMuted} />
          <span>Continue with SSO</span>
        </button>
      </div>

      {/* Divider */}
      <div className="w-full flex items-center gap-3 mb-6">
        <div className={`flex-1 h-px ${darkMode ? 'bg-gray-800' : 'bg-[rgba(55,53,47,0.09)]'}`} />
        <span className={`text-xs font-medium ${theme.textMuted}`}>OR</span>
        <div className={`flex-1 h-px ${darkMode ? 'bg-gray-800' : 'bg-[rgba(55,53,47,0.09)]'}`} />
      </div>

      {/* Email Form */}
      <form onSubmit={handleSubmit} className="w-full space-y-4">
        {!isLogin && (
           <div className="space-y-1.5">
             <label className={`text-xs font-medium ${theme.textMuted} uppercase tracking-wide`}>Full Name</label>
             <input
               type="text"
               name="name"
               value={formData.name}
               onChange={handleInputChange}
               placeholder="Enter your name"
               className={`w-full px-3 py-2 text-[14px] rounded-[4px] border shadow-sm focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-shadow ${theme.input}`}
             />
           </div>
        )}

        <div className="space-y-1.5">
            <label className={`text-xs font-medium ${theme.textMuted} uppercase tracking-wide`}>Work Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="name@company.com"
              className={`w-full px-3 py-2 text-[14px] rounded-[4px] border shadow-sm focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-shadow ${theme.input}`}
            />
        </div>

        <div className="space-y-1.5">
            <label className={`text-xs font-medium ${theme.textMuted} uppercase tracking-wide`}>Password</label>
            <div className="relative">
                <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Enter password"
                className={`w-full px-3 py-2 pr-10 text-[14px] rounded-[4px] border shadow-sm focus:ring-1 focus:ring-violet-500 focus:border-violet-500 transition-shadow ${theme.input}`}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>
        </div>

        {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-300 text-sm rounded-[4px] border border-red-100 dark:border-red-900/50">
                {error}
            </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-[4px] text-[14px] transition-all shadow-sm flex items-center justify-center gap-2 mt-2"
        >
          {isLoading ? (
             <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
             isLogin ? 'Log in' : 'Sign up with Email'
          )}
        </button>
      </form>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className={`text-sm ${theme.textMuted}`}>
          {isLogin ? "Don't have an account?" : "Already have an account?"}
          <button
            onClick={() => { setIsLogin(!isLogin); setError(''); }}
            className="ml-1.5 font-medium text-violet-600 hover:underline decoration-violet-600/30 underline-offset-4"
          >
            {isLogin ? 'Sign up' : 'Log in'}
          </button>
        </p>
      </div>

      <div className="mt-8 flex items-center justify-center gap-4">
            <button onClick={onToggleDarkMode} className={`p-2 rounded-full ${theme.button} transition`}>
                 {darkMode ? <Sun size={14} className={theme.textMuted} /> : <Moon size={14} className={theme.textMuted} />}
            </button>
      </div>
    </div>
  )
}

export default LoginForm