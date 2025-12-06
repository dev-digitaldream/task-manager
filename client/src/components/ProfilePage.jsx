import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    ArrowLeft, User, Mail, Lock, Bell, Palette, Globe,
    Shield, LogOut, Camera, Save, Eye, EyeOff, Smartphone,
    Moon, Sun, Languages, Download, Trash2, Check, X,
    Calendar, Puzzle
} from 'lucide-react';
import MobileNav from './MobileNav';

const ProfilePage = ({ currentUser, onLogout, onUpdate }) => {
    const [activeSection, setActiveSection] = useState('profile');
    const [showPassword, setShowPassword] = useState(false);
    const [darkMode, setDarkMode] = useState(false);
    const [language, setLanguage] = useState('fr');

    // États pour le formulaire de profil
    const [formData, setFormData] = useState({
        name: currentUser?.name || '',
        email: currentUser?.email || '',
        avatar: currentUser?.avatar || '👤',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    // États pour les notifications
    const [notifications, setNotifications] = useState({
        email: true,
        push: false,
        taskAssigned: true,
        taskCompleted: true,
        comments: true,
        mentions: true
    });

    const handleSaveProfile = () => {
        // Logique de sauvegarde
        if (onUpdate) {
            onUpdate(formData);
        }
        alert('Profil mis à jour !');
    };

    const handleChangePassword = () => {
        if (formData.newPassword !== formData.confirmPassword) {
            alert('Les mots de passe ne correspondent pas');
            return;
        }
        alert('Mot de passe changé !');
        setFormData({ ...formData, currentPassword: '', newPassword: '', confirmPassword: '' });
    };

    const sections = [
        { id: 'profile', label: 'Mon Profil', icon: User },
        { id: 'security', label: 'Sécurité', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'appearance', label: 'Apparence', icon: Palette },
        { id: 'integrations', label: 'Intégrations', icon: Puzzle },
        { id: 'language', label: 'Langue & Région', icon: Globe },
        { id: 'data', label: 'Données', icon: Download }
    ];

    return (
        <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
            {/* Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/modern"
                            className="p-2 hover:bg-slate-100 rounded-lg transition"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-600" />
                        </Link>
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-slate-900">Paramètres</h1>
                            <p className="text-sm text-slate-500 mt-1 hidden md:block">
                                Gérez votre profil et vos préférences
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
                        <div className="bg-white rounded-lg border border-slate-200 p-2 space-y-1">
                            {sections.map((section) => {
                                const Icon = section.icon;
                                return (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${activeSection === section.id
                                            ? 'bg-indigo-50 text-indigo-600'
                                            : 'text-slate-700 hover:bg-slate-50'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5" />
                                        <span className="hidden md:inline">{section.label}</span>
                                    </button>
                                );
                            })}

                            <div className="pt-2 mt-2 border-t border-slate-100">
                                <button
                                    onClick={onLogout}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition"
                                >
                                    <LogOut className="w-5 h-5" />
                                    <span className="hidden md:inline">Déconnexion</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-lg border border-slate-200 p-6">

                            {/* Section: Mon Profil */}
                            {activeSection === 'profile' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 mb-1">Mon Profil</h2>
                                        <p className="text-sm text-slate-500">Gérez vos informations personnelles</p>
                                    </div>

                                    {/* Avatar */}
                                    <div className="flex items-center gap-6">
                                        <div className="relative group">
                                            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                                                {formData.avatar?.startsWith('/') || formData.avatar?.startsWith('http') ? (
                                                    <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-4xl">{formData.avatar}</span>
                                                )}
                                            </div>
                                            <label className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition shadow-lg cursor-pointer">
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
                                                                alert('Avatar mis à jour !');
                                                            } else {
                                                                alert('Erreur lors de l\'upload');
                                                            }
                                                        } catch (err) {
                                                            console.error(err);
                                                            alert('Erreur réseau');
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900">{formData.name}</h3>
                                            <p className="text-sm text-slate-500">{formData.email}</p>
                                            <label className="mt-2 inline-block text-sm text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer">
                                                Changer l'avatar
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={async (e) => {
                                                        const file = e.target.files[0];
                                                        if (!file) return;
                                                        // Trigger same logic as above (could be refactored)
                                                        const formDataUpload = new FormData();
                                                        formDataUpload.append('avatar', file);
                                                        const res = await fetch(`/api/users/${currentUser.id}/avatar`, { method: 'POST', body: formDataUpload });
                                                        if (res.ok) {
                                                            const updatedUser = await res.json();
                                                            setFormData(prev => ({ ...prev, avatar: updatedUser.avatar }));
                                                            if (onUpdate) onUpdate({ avatar: updatedUser.avatar });
                                                        }
                                                    }}
                                                />
                                            </label>
                                        </div>
                                    </div>

                                    {/* Form */}
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Nom complet
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                        </div>

                                        <button
                                            onClick={handleSaveProfile}
                                            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                                        >
                                            <Save className="w-4 h-4" />
                                            Enregistrer les modifications
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Section: Sécurité */}
                            {activeSection === 'security' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 mb-1">Sécurité</h2>
                                        <p className="text-sm text-slate-500">Protégez votre compte</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Mot de passe actuel
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    value={formData.currentPassword}
                                                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                                                    className="w-full px-4 py-2 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                />
                                                <button
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                >
                                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Nouveau mot de passe
                                            </label>
                                            <input
                                                type="password"
                                                value={formData.newPassword}
                                                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Confirmer le mot de passe
                                            </label>
                                            <input
                                                type="password"
                                                value={formData.confirmPassword}
                                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            />
                                        </div>

                                        <button
                                            onClick={handleChangePassword}
                                            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-medium"
                                        >
                                            <Lock className="w-4 h-4" />
                                            Changer le mot de passe
                                        </button>
                                    </div>

                                    {/* Two-Factor Auth */}
                                    <div className="pt-6 border-t border-slate-100">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-semibold text-slate-900">Authentification à deux facteurs</h3>
                                                <p className="text-sm text-slate-500 mt-1">Ajoutez une couche de sécurité supplémentaire</p>
                                            </div>
                                            <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition font-medium text-sm">
                                                Activer
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Section: Notifications */}
                            {activeSection === 'notifications' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 mb-1">Notifications</h2>
                                        <p className="text-sm text-slate-500">Choisissez comment vous souhaitez être notifié</p>
                                    </div>

                                    <div className="space-y-4">
                                        {[
                                            { key: 'email', label: 'Notifications par email', icon: Mail },
                                            { key: 'push', label: 'Notifications push', icon: Smartphone },
                                            { key: 'taskAssigned', label: 'Tâche assignée', icon: User },
                                            { key: 'taskCompleted', label: 'Tâche terminée', icon: Check },
                                            { key: 'comments', label: 'Nouveaux commentaires', icon: Bell },
                                            { key: 'mentions', label: 'Mentions (@vous)', icon: Bell }
                                        ].map((item) => {
                                            const Icon = item.icon;
                                            return (
                                                <div key={item.key} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
                                                    <div className="flex items-center gap-3">
                                                        <Icon className="w-5 h-5 text-slate-400" />
                                                        <span className="text-sm font-medium text-slate-700">{item.label}</span>
                                                    </div>
                                                    <button
                                                        onClick={() => setNotifications({ ...notifications, [item.key]: !notifications[item.key] })}
                                                        className={`relative w-12 h-6 rounded-full transition ${notifications[item.key] ? 'bg-indigo-600' : 'bg-slate-300'
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
                                </div>
                            )}

                            {/* Section: Apparence */}
                            {activeSection === 'appearance' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 mb-1">Apparence</h2>
                                        <p className="text-sm text-slate-500">Personnalisez l'interface</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-3">
                                                Thème
                                            </label>
                                            <div className="grid grid-cols-3 gap-3">
                                                <button className="p-4 border-2 border-indigo-600 rounded-lg hover:bg-slate-50 transition">
                                                    <Sun className="w-6 h-6 mx-auto mb-2 text-amber-500" />
                                                    <span className="text-sm font-medium">Clair</span>
                                                </button>
                                                <button className="p-4 border-2 border-slate-200 rounded-lg hover:bg-slate-50 transition">
                                                    <Moon className="w-6 h-6 mx-auto mb-2 text-slate-700" />
                                                    <span className="text-sm font-medium">Sombre</span>
                                                </button>
                                                <button className="p-4 border-2 border-slate-200 rounded-lg hover:bg-slate-50 transition">
                                                    <Smartphone className="w-6 h-6 mx-auto mb-2 text-slate-500" />
                                                    <span className="text-sm font-medium">Auto</span>
                                                </button>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-3">
                                                Couleur d'accent
                                            </label>
                                            <div className="flex gap-3">
                                                {['indigo', 'blue', 'purple', 'pink', 'emerald', 'amber'].map((color) => (
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

                            {/* Section: Langue & Région */}
                            {activeSection === 'language' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 mb-1">Langue & Région</h2>
                                        <p className="text-sm text-slate-500">Configurez vos préférences régionales</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Langue de l'interface
                                            </label>
                                            <select
                                                value={language}
                                                onChange={(e) => setLanguage(e.target.value)}
                                                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            >
                                                <option value="fr">Français</option>
                                                <option value="en">English</option>
                                                <option value="es">Español</option>
                                                <option value="de">Deutsch</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Fuseau horaire
                                            </label>
                                            <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                                                <option>Europe/Paris (GMT+1)</option>
                                                <option>Europe/London (GMT+0)</option>
                                                <option>America/New_York (GMT-5)</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                                Format de date
                                            </label>
                                            <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent">
                                                <option>DD/MM/YYYY</option>
                                                <option>MM/DD/YYYY</option>
                                                <option>YYYY-MM-DD</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Section: Données */}
                            {activeSection === 'data' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 mb-1">Données</h2>
                                        <p className="text-sm text-slate-500">Gérez vos données personnelles</p>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="p-4 bg-blue-50 border border-blue-100 rounded-lg">
                                            <div className="flex items-start gap-3">
                                                <Download className="w-5 h-5 text-blue-600 mt-0.5" />
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-blue-900">Exporter mes données</h3>
                                                    <p className="text-sm text-blue-700 mt-1">
                                                        Téléchargez une copie de toutes vos données (tâches, dépenses, pages)
                                                    </p>
                                                    <button className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm">
                                                        Télécharger mes données
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-red-50 border border-red-100 rounded-lg">
                                            <div className="flex items-start gap-3">
                                                <Trash2 className="w-5 h-5 text-red-600 mt-0.5" />
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-red-900">Supprimer mon compte</h3>
                                                    <p className="text-sm text-red-700 mt-1">
                                                        Cette action est irréversible. Toutes vos données seront définitivement supprimées.
                                                    </p>
                                                    <button className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm">
                                                        Supprimer mon compte
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Section: Intégrations */}
                            {activeSection === 'integrations' && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900 mb-1">Intégrations</h2>
                                        <p className="text-sm text-slate-500">Connectez vos outils favoris</p>
                                    </div>

                                    <div className="space-y-4">
                                        {/* iCal */}
                                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                            <div className="flex items-start gap-4">
                                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                                    <Calendar className="w-6 h-6 text-blue-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-slate-900">iCal / CalDAV</h3>
                                                    <p className="text-sm text-slate-600 mb-3">
                                                        Synchronisez vos tâches avec Apple Calendar, ou tout client compatible iCal.
                                                    </p>
                                                    <div className="flex gap-2">
                                                        <button
                                                            onClick={() => window.open(`/api/tasks/export/ical?userId=${currentUser.id}`)}
                                                            className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded text-sm font-medium hover:bg-slate-50"
                                                        >
                                                            Télécharger .ics
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                const res = await fetch(`/api/tasks/subscribe/ical?userId=${currentUser.id}`);
                                                                const data = await res.json();
                                                                navigator.clipboard.writeText(data.url);
                                                                alert('Lien copié !');
                                                            }}
                                                            className="px-3 py-1.5 bg-blue-600 text-white rounded text-sm font-medium hover:bg-blue-700"
                                                        >
                                                            Copier lien d'abonnement
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Google Calendar */}
                                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                            <div className="flex items-start gap-4">
                                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                                    <Calendar className="w-6 h-6 text-red-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-slate-900">Google Calendar</h3>
                                                    <p className="text-sm text-slate-600 mb-3">
                                                        Ajoutez vos tâches comme un agenda Google Calendar via URL.
                                                    </p>
                                                    <button
                                                        onClick={async () => {
                                                            const res = await fetch(`/api/tasks/subscribe/ical?userId=${currentUser.id}`);
                                                            const data = await res.json();
                                                            navigator.clipboard.writeText(data.url);
                                                            alert('URL copiée ! Ajoutez-la dans Google Agenda > Ajouter par URL');
                                                        }}
                                                        className="px-3 py-1.5 bg-white border border-slate-300 text-slate-700 rounded text-sm font-medium hover:bg-slate-50"
                                                    >
                                                        Obtenir l'URL
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Outlook */}
                                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg">
                                            <div className="flex items-start gap-4">
                                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                                    <Mail className="w-6 h-6 text-cyan-600" />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-semibold text-slate-900">Microsoft Outlook</h3>
                                                    <p className="text-sm text-slate-600 mb-3">
                                                        Add-in pour transformer vos emails en tâches.
                                                    </p>
                                                    <button
                                                        onClick={() => window.open('/api/integrations/outlook/manifest', '_blank')}
                                                        className="px-3 py-1.5 bg-cyan-600 text-white rounded text-sm font-medium hover:bg-cyan-700"
                                                    >
                                                        Télécharger le Manifeste (XML)
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
        </div>
    );
};

export default ProfilePage;
