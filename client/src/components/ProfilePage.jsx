import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowLeft, User, Mail, Lock, Bell, Palette, Globe,
    Shield, LogOut, Camera, Save, Eye, EyeOff, Smartphone,
    Moon, Sun, Languages, Download, Trash2, Check, X,
    Calendar, Puzzle, Settings
} from 'lucide-react';
import MobileNav from './MobileNav';
import TwoFactorSetup from './TwoFactorSetup';

const ProfilePage = ({ currentUser, onLogout, onUpdate }) => {
    const [activeSection, setActiveSection] = useState('profile');
    const [showPassword, setShowPassword] = useState(false);
    const [show2FASetup, setShow2FASetup] = useState(false);

    const darkMode = document.documentElement.classList.contains('dark');
    const theme = {
        bg: darkMode ? 'bg-[#0d1117]' : 'bg-[#faf9f7]',
        card: darkMode ? 'bg-[#21262d]' : 'bg-white',
        cardBorder: darkMode ? 'border-gray-700' : 'border-gray-200',
        text: darkMode ? 'text-gray-100' : 'text-gray-900',
        textMuted: darkMode ? 'text-gray-400' : 'text-gray-500',
        input: darkMode ? 'bg-gray-800 border-gray-600 text-gray-100' : 'bg-white border-gray-300 text-gray-900',
        hover: darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50',
    };

    // Form state
    const [formData, setFormData] = useState({
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        avatar: currentUser?.avatar || '👤',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // Notifications state - load from localStorage
    const [notifications, setNotifications] = useState(() => {
        const saved = localStorage.getItem('flowspaces_notifications');
        if (saved) {
            try {
                return JSON.parse(saved);
            } catch {
                return {
                    email: true,
                    push: false,
                    taskAssigned: true,
                    taskCompleted: true,
                    comments: true,
                    mentions: true
                };
            }
        }
        return {
            email: true,
            push: false,
            taskAssigned: true,
            taskCompleted: true,
            comments: true,
            mentions: true
        };
    });
    const [saving, setSaving] = useState(false);

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/users/${currentUser.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    avatar: formData.avatar
                })
            });
            if (res.ok) {
                const updatedUser = await res.json();
                // Update localStorage
                const storedUser = JSON.parse(localStorage.getItem('currentUser') || '{}');
                localStorage.setItem('currentUser', JSON.stringify({ ...storedUser, ...updatedUser }));
                if (onUpdate) onUpdate(updatedUser);
                alert('Profile updated!');
            } else {
                alert('Error updating profile');
            }
        } catch (err) {
            console.error(err);
            alert('Network error');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (formData.newPassword !== formData.confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        if (formData.newPassword.length < 8) {
            alert('Password must be at least 8 characters');
            return;
        }
        setSaving(true);
        try {
            const res = await fetch(`/api/users/${currentUser.id}/password`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    currentPassword: formData.currentPassword,
                    newPassword: formData.newPassword
                })
            });
            if (res.ok) {
                alert('Password changed!');
                setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                const data = await res.json();
                alert(data.error || 'Error changing password');
            }
        } catch (err) {
            console.error(err);
            alert('Network error');
        } finally {
            setSaving(false);
        }
    };

    const sections = [
        { id: 'profile', label: 'My Profile', icon: User },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'appearance', label: 'Appearance', icon: Palette },
        { id: 'integrations', label: 'Integrations', icon: Puzzle },
        { id: 'language', label: 'Language & Region', icon: Globe },
        { id: 'data', label: 'Data', icon: Download }
    ];

    return (
        <div className={`min-h-screen ${theme.bg} pb-20 md:pb-0`}>
            {/* Header */}
            <div className={`${theme.card} border-b ${theme.cardBorder}`}>
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/modern"
                            className={`p-2 ${theme.hover} rounded-lg transition md:hidden`}
                        >
                            <ArrowLeft className={`w-5 h-5 ${theme.textMuted}`} />
                        </Link>
                        <div>
                            <h1 className={`text-xl md:text-2xl font-bold ${theme.text} flex items-center gap-2`}>
                                <Settings className="w-6 h-6 text-violet-600" />
                                Settings
                            </h1>
                            <p className={`text-sm ${theme.textMuted} mt-1 hidden md:block`}>
                                Manage your profile and preferences
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-1">
                        <div className={`${theme.card} rounded-lg border ${theme.cardBorder} p-2 space-y-1`}>
                            {sections.map((section) => {
                                const Icon = section.icon;
                                return (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeSection === section.id
                                            ? 'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400'
                                            : `${theme.text} ${theme.hover}`
                                        }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="hidden md:inline">{section.label}</span>
                                    </button>
                                );
                            })}

                            <div className={`pt-2 mt-2 border-t ${theme.cardBorder}`}>
                                <button
                                    onClick={onLogout}
                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 ${darkMode ? 'hover:bg-red-900/30' : 'hover:bg-red-50'} transition`}
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span className="hidden md:inline">Log Out</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className={`${theme.card} rounded-lg border ${theme.cardBorder} p-6`}>

                            {/* Section: Profile */}
                            {activeSection === 'profile' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className={`text-xl font-bold ${theme.text} mb-1`}>My Profile</h2>
                                        <p className={`text-sm ${theme.textMuted}`}>Manage your personal information</p>
                                    </div>

                                    {/* Avatar */}
                                    <div className="flex items-center gap-6">
                                        <div className="relative group">
                                            <div className={`w-24 h-24 ${darkMode ? 'bg-violet-900/30' : 'bg-violet-100'} rounded-full flex items-center justify-center overflow-hidden border-4 ${darkMode ? 'border-gray-800' : 'border-white'} shadow-lg`}>
                                                {formData.avatar?.startsWith('/') || formData.avatar?.startsWith('http') ? (
                                                    <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-4xl">{formData.avatar}</span>
                                                )}
                                            </div>
                                            <label className="absolute bottom-0 right-0 p-2 bg-violet-600 text-white rounded-full hover:bg-violet-700 transition shadow-lg cursor-pointer">
                                                <Camera className="w-4 h-4" />
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={async (e) => {
                                                        const file = e.target.files[0];
                                                        if (!file) return;

                                                        const formDataUpload = new FormData();
                                                        formDataUpload.append('avatar', file);

                                                        try {
                                                            const res = await fetch(`/api/users/${currentUser.id}/avatar`, {
                                                                method: 'POST',
                                                                body: formDataUpload
                                                            });
                                                            if (res.ok) {
                                                                const updatedUser = await res.json();
                                                                setFormData(prev => ({ ...prev, avatar: updatedUser.avatar }));
                                                                if (onUpdate) onUpdate({ avatar: updatedUser.avatar });
                                                                alert('Avatar updated!');
                                                            } else {
                                                                alert('Upload error');
                                                            }
                                                        } catch (err) {
                                                            console.error(err);
                                                            alert('Network error');
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>
                                        <div>
                                            <h3 className={`font-semibold ${theme.text}`}>{formData.name}</h3>
                                            <p className={`text-sm ${theme.textMuted}`}>{formData.email}</p>
                                            <label className="mt-2 inline-block text-sm text-violet-600 hover:text-violet-700 font-medium cursor-pointer">
                                                Change avatar
                                                <input type="file" className="hidden" accept="image/*" />
                                            </label>
                                        </div>
                                    </div>

                                    {/* Form */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                                Full Name
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent ${theme.input}`}
                                            />
                                        </div>

                                        <div>
                                            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent ${theme.input}`}
                                            />
                                        </div>

                                        <button
                                            onClick={handleSaveProfile}
                                            className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition font-medium"
                                        >
                                            <Save className="w-4 h-4" />
                                            Save Changes
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Section: Security */}
                            {activeSection === 'security' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className={`text-xl font-bold ${theme.text} mb-1`}>Security</h2>
                                        <p className={`text-sm ${theme.textMuted}`}>Protect your account</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                                Current Password
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={formData.currentPassword}
                                                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                                    className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent ${theme.input}`}
                                                />
                                                <button
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className={`absolute right-3 top-1/2 -translate-y-1/2 ${theme.textMuted}`}
                                                >
                                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                                New Password
                                            </label>
                                            <input
                                                type="password"
                                                value={formData.newPassword}
                                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent ${theme.input}`}
                                            />
                                        </div>

                                        <div>
                                            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                                Confirm Password
                                            </label>
                                            <input
                                                type="password"
                                                value={formData.confirmPassword}
                                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent ${theme.input}`}
                                            />
                                        </div>

                                        <button
                                            onClick={handleChangePassword}
                                            className="flex items-center gap-2 px-6 py-2.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition font-medium"
                                        >
                                            <Lock className="w-4 h-4" />
                                            Change Password
                                        </button>
                                    </div>

                                    {/* Two-Factor Auth */}
                                    <div className={`pt-6 border-t ${theme.cardBorder}`}>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className={`font-semibold ${theme.text}`}>Two-Factor Authentication</h3>
                                                <p className={`text-sm ${theme.textMuted} mt-1`}>Add an extra layer of security</p>
                                            </div>
                                            <button 
                                                onClick={() => setShow2FASetup(true)}
                                                className={`px-4 py-2 ${currentUser?.twoFactorEnabled 
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                                                    : darkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                } rounded-lg transition font-medium text-sm`}
                                            >
                                                {currentUser?.twoFactorEnabled ? '✓ Enabled' : 'Enable'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Section: Notifications */}
                            {activeSection === 'notifications' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className={`text-xl font-bold ${theme.text} mb-1`}>Notifications</h2>
                                        <p className={`text-sm ${theme.textMuted}`}>Choose how you want to be notified</p>
                                    </div>

                                    <div className="space-y-4">
                                        {[
                                            { key: 'email', label: 'Email notifications', icon: Mail },
                                            { key: 'push', label: 'Push notifications', icon: Smartphone },
                                            { key: 'taskAssigned', label: 'Task assigned', icon: User },
                                            { key: 'taskCompleted', label: 'Task completed', icon: Check },
                                            { key: 'comments', label: 'New comments', icon: Bell },
                                            { key: 'mentions', label: 'Mentions (@you)', icon: Bell }
                                        ].map((item) => {
                                            const Icon = item.icon;
                                            return (
                                                <div key={item.key} className={`flex items-center justify-between py-3 border-b ${theme.cardBorder} last:border-0`}>
                                                    <div className="flex items-center gap-3">
                                                        <Icon className={`w-5 h-5 ${theme.textMuted}`} />
                                                        <span className={`text-sm font-medium ${theme.text}`}>{item.label}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => {
                                                            const newNotifications = { ...notifications, [item.key]: !notifications[item.key] };
                                                            setNotifications(newNotifications);
                                                            // Save to localStorage immediately
                                                            localStorage.setItem('flowspaces_notifications', JSON.stringify(newNotifications));
                                                        }}
                                                        className={`relative w-12 h-6 rounded-full transition ${notifications[item.key] ? 'bg-violet-600' : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                                                        }`}
                                                    >
                                                        <span
                                                            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${notifications[item.key] ? 'translate-x-6' : 'translate-x-0'
                                                            }`}
                                                        />
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <p className={`text-xs ${theme.textMuted}`}>Changes are saved automatically</p>
                                </div>
                            )}

                            {/* Section: Appearance */}
                            {activeSection === 'appearance' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className={`text-xl font-bold ${theme.text} mb-1`}>Appearance</h2>
                                        <p className={`text-sm ${theme.textMuted}`}>Customize the interface</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className={`block text-sm font-medium ${theme.text} mb-3`}>
                                                Theme
                                            </label>
                                            <div className="grid grid-cols-3 gap-3">
                                                <button 
                                                    onClick={() => {
                                                        localStorage.setItem('flowspaces_darkmode', 'false');
                                                        document.documentElement.classList.remove('dark');
                                                        window.location.reload();
                                                    }}
                                                    className={`p-4 border-2 ${!darkMode ? 'border-violet-600' : 'border-gray-600'} rounded-lg ${theme.hover} transition`}
                                                >
                                                    <Sun className="w-6 h-6 mx-auto mb-2 text-amber-500" />
                                                    <span className={`text-sm font-medium ${theme.text}`}>Light</span>
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        localStorage.setItem('flowspaces_darkmode', 'true');
                                                        document.documentElement.classList.add('dark');
                                                        window.location.reload();
                                                    }}
                                                    className={`p-4 border-2 ${darkMode ? 'border-violet-600' : 'border-gray-200'} rounded-lg ${theme.hover} transition`}
                                                >
                                                    <Moon className="w-6 h-6 mx-auto mb-2 text-slate-700" />
                                                    <span className={`text-sm font-medium ${theme.text}`}>Dark</span>
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        localStorage.removeItem('flowspaces_darkmode');
                                                        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                                                        document.documentElement.classList.toggle('dark', prefersDark);
                                                        window.location.reload();
                                                    }}
                                                    className={`p-4 border-2 border-gray-200 dark:border-gray-600 rounded-lg ${theme.hover} transition`}
                                                >
                                                    <Smartphone className="w-6 h-6 mx-auto mb-2 text-slate-500" />
                                                    <span className={`text-sm font-medium ${theme.text}`}>Auto</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className={`block text-sm font-medium ${theme.text} mb-3`}>
                                                Accent Color
                                            </label>
                                            <div className="flex gap-3">
                                                {['violet', 'blue', 'purple', 'pink', 'emerald', 'amber'].map((color) => (
                                                    <button
                                                        key={color}
                                                        className={`w-10 h-10 rounded-full bg-${color}-600 hover:scale-110 transition`}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Section: Language & Region */}
                            {activeSection === 'language' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className={`text-xl font-bold ${theme.text} mb-1`}>Language & Region</h2>
                                        <p className={`text-sm ${theme.textMuted}`}>Configure your regional preferences</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                                Interface Language
                                            </label>
                                            <select 
                                                value={localStorage.getItem('i18nextLng') || 'en'}
                                                onChange={(e) => {
                                                    localStorage.setItem('i18nextLng', e.target.value);
                                                    window.location.reload();
                                                }}
                                                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent ${theme.input}`}
                                            >
                                                <option value="en">🇬🇧 English</option>
                                                <option value="fr">🇫🇷 Français</option>
                                                <option value="nl">🇳🇱 Nederlands</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                                Timezone
                                            </label>
                                            <select className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent ${theme.input}`}>
                                                <option>America/New_York (GMT-5)</option>
                                                <option>America/Los_Angeles (GMT-8)</option>
                                                <option>Europe/London (GMT+0)</option>
                                                <option>Europe/Paris (GMT+1)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'} mb-2`}>
                                                Date Format
                                            </label>
                                            <select className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent ${theme.input}`}>
                                                <option>MM/DD/YYYY</option>
                                                <option>DD/MM/YYYY</option>
                                                <option>YYYY-MM-DD</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Section: Data */}
                            {activeSection === 'data' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className={`text-xl font-bold ${theme.text} mb-1`}>Data</h2>
                                        <p className={`text-sm ${theme.textMuted}`}>Manage your personal data</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className={`p-4 ${darkMode ? 'bg-blue-900/20 border-blue-800' : 'bg-blue-50 border-blue-100'} border rounded-lg`}>
                                            <div className="flex items-start gap-3">
                                                <Download className={`w-5 h-5 ${darkMode ? 'text-blue-400' : 'text-blue-600'} mt-0.5`} />
                                                <div className="flex-1">
                                                    <h3 className={`font-semibold ${darkMode ? 'text-blue-100' : 'text-blue-900'}`}>Export my data</h3>
                                                    <p className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-700'} mt-1`}>
                                                        Download a copy of all your data (tasks, expenses, pages)
                                                    </p>
                                                    <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm">
                                                        Download my data
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className={`p-4 ${darkMode ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-100'} border rounded-lg`}>
                                            <div className="flex items-start gap-3">
                                                <Trash2 className={`w-5 h-5 ${darkMode ? 'text-red-400' : 'text-red-600'} mt-0.5`} />
                                                <div className="flex-1">
                                                    <h3 className={`font-semibold ${darkMode ? 'text-red-100' : 'text-red-900'}`}>Delete my account</h3>
                                                    <p className={`text-sm ${darkMode ? 'text-red-300' : 'text-red-700'} mt-1`}>
                                                        This action is irreversible. All your data will be permanently deleted.
                                                    </p>
                                                    <button className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm">
                                                        Delete my account
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Section: Integrations */}
                            {activeSection === 'integrations' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className={`text-xl font-bold ${theme.text} mb-1`}>Integrations</h2>
                                        <p className={`text-sm ${theme.textMuted}`}>Connect your favorite tools</p>
                                    </div>

                                    <div className="space-y-4">
                                        {/* iCal */}
                                        <div className={`p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border rounded-lg`}>
                                            <div className="flex items-start gap-4">
                                                <div className={`p-2 ${theme.card} rounded-lg shadow-sm`}>
                                                    <Calendar className="w-6 h-6 text-blue-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className={`font-semibold ${theme.text}`}>iCal / CalDAV</h3>
                                                    <p className={`text-sm ${theme.textMuted} mb-3`}>
                                                        Sync your tasks with Apple Calendar or any iCal compatible client.
                                                    </p>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => window.open(`/api/tasks/export/ical?userId=${currentUser.id}`)}
                                                            className={`px-3 py-1.5 ${theme.card} border ${theme.cardBorder} ${theme.text} rounded text-sm font-medium ${theme.hover}`}
                                                        >
                                                            Download .ics
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                const res = await fetch(`/api/tasks/subscribe/ical?userId=${currentUser.id}`);
                                                                const data = await res.json();
                                                                navigator.clipboard.writeText(data.url);
                                                                alert('Link copied!');
                                                            }}
                                                            className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
                                                        >
                                                            Copy subscription link
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Google Calendar */}
                                        <div className={`p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border rounded-lg`}>
                                            <div className="flex items-start gap-4">
                                                <div className={`p-2 ${theme.card} rounded-lg shadow-sm`}>
                                                    <Calendar className="w-6 h-6 text-red-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className={`font-semibold ${theme.text}`}>Google Calendar</h3>
                                                    <p className={`text-sm ${theme.textMuted} mb-3`}>
                                                        Add your tasks as a Google Calendar via URL.
                                                    </p>
                                                    <button
                                                        onClick={async () => {
                                                            const res = await fetch(`/api/tasks/subscribe/ical?userId=${currentUser.id}`);
                                                            const data = await res.json();
                                                            navigator.clipboard.writeText(data.url);
                                                            alert('URL copied! Add it in Google Calendar > Add by URL');
                                                        }}
                                                        className={`px-3 py-1.5 ${theme.card} border ${theme.cardBorder} ${theme.text} rounded text-sm font-medium ${theme.hover}`}
                                                    >
                                                        Get URL
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Outlook */}
                                        <div className={`p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'} border rounded-lg`}>
                                            <div className="flex items-start gap-4">
                                                <div className={`p-2 ${theme.card} rounded-lg shadow-sm`}>
                                                    <Mail className="w-6 h-6 text-cyan-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className={`font-semibold ${theme.text}`}>Microsoft Outlook</h3>
                                                    <p className={`text-sm ${theme.textMuted} mb-3`}>
                                                        Add-in to convert your emails into tasks.
                                                    </p>
                                                    <button
                                                        onClick={() => window.open('/api/integrations/outlook/manifest', '_blank')}
                                                        className="px-3 py-1.5 bg-cyan-600 text-white rounded text-sm font-medium hover:bg-cyan-700"
                                                    >
                                                        Download Manifest (XML)
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            <MobileNav />

            {/* Two-Factor Authentication Setup Modal */}
            {show2FASetup && (
                <TwoFactorSetup
                    userId={currentUser?.id}
                    onClose={() => setShow2FASetup(false)}
                    onComplete={() => {
                        // Optionally refresh user data or update local state
                        if (onUpdate) {
                            onUpdate({ twoFactorEnabled: true });
                        }
                    }}
                />
            )}
        </div>
    );
};

export default ProfilePage;
