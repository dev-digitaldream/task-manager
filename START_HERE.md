# 🚀 Task Manager - Guide de Démarrage

## ✅ NETTOYAGE EFFECTUÉ

L'application a été nettoyée et tous les fichiers dupliqués ont été supprimés.

### Fichiers supprimés:
- ❌ `DashboardClean.jsx` (doublon)
- ❌ `ModernDashboard.jsx` (doublon)
- ❌ `TaskListClean.jsx` (doublon)

### Fichiers utilisés (version unique):
- ✅ `Dashboard.jsx` - Dashboard public
- ✅ `TaskList.jsx` - Liste des tâches
- ✅ `KanbanBoard.jsx` - Vue Kanban avec drag & drop

## 🎯 APPLICATION LANCÉE

```
✅ Backend: http://localhost:3001
✅ Frontend: http://localhost:5173
✅ WebSocket: Connecté
```

## 🔑 CONNEXION SIMPLIFIÉE

### Mode Simple (PAR DÉFAUT - Aucun mot de passe!)

1. Ouvre http://localhost:5173/login
2. Entre juste ton **nom** (ex: "Mohammed", "Test", etc.)
3. Choisis un **avatar** 👤
4. Click sur **"Login"**
5. ✨ C'est tout! Tu es connecté!

**Aucun email ni mot de passe requis!**

## 📍 Routes Disponibles

| Route | Description | Authentification |
|-------|-------------|------------------|
| `/` | Redirect vers /dashboard | Non |
| `/dashboard` | Dashboard public en temps réel | Non |
| `/login` | Page de connexion | Non |
| `/app` | Vue liste des tâches | Oui |
| `/kanban` | Vue Kanban (drag & drop) | Oui |
| `/meeting` | Mode meeting | Non |
| `/analytics` | Statistiques | Non |

## 🎨 Nouvelles Fonctionnalités

### 1. Vue Kanban 🎯
- Drag & drop entre colonnes
- Bordures colorées par priorité
- Filtres avancés
- Animation fluide

### 2. Export Calendrier 📅
- Click sur icône **Settings** (engrenage)
- Export iCal pour:
  - Apple Calendar
  - Google Calendar
  - Outlook
  - App Rappels (macOS/iOS)

### 3. Dark Mode 🌙
- Click sur icône **Soleil/Lune**
- 3 modes: Clair, Sombre, Système

### 4. Couleurs par Priorité 🎨
- 🔴 Rouge = Urgente
- 🟠 Orange = Haute
- 🟡 Jaune = Moyenne
- ⚪ Gris = Basse

## 🛠️ Commandes Utiles

### Lancer l'application
```bash
npm run dev
```

### Arrêter
```bash
# Ctrl+C dans le terminal
# OU
lsof -ti:5173,3001 | xargs kill -9
```

### Reset la base de données
```bash
cd server
npm run db:seed
```

### Voir la base de données
```bash
cd server
npx prisma studio
# Ouvre http://localhost:5555
```

## 🐛 Dépannage

### Page blanche?
1. Ouvre la console (F12)
2. Vérifie les erreurs JavaScript
3. Rafraîchis la page (Cmd+R ou F5)

### Problème de connexion?
1. Utilise le **mode Simple** (par défaut)
2. Entre juste ton nom
3. Pas besoin d'email/password!

### Processus multiples?
```bash
# Tue tous les processus Node/Vite
pkill -f "node\|vite"

# Libère les ports
lsof -ti:5173,3001,5555 | xargs kill -9

# Relance
npm run dev
```

## 📚 Documentation

- `CHANGELOG_IMPROVEMENTS.md` - Liste des améliorations
- `TEST_GUIDE.md` - Guide de test
- `CREDENTIALS.md` - Infos de connexion
- `README_TAURI.md` - App desktop (à venir)
- `CLAUDE.md` - Guide développeur

## 🎊 Version Actuelle

**Version propre et unifiée!**
- ✅ Fichiers dupliqués supprimés
- ✅ Une seule version de chaque composant
- ✅ Application stable et fonctionnelle
- ✅ Mode connexion simple activé

---

**Profite de ton Task Manager! 🚀**

Si tu as des questions, ouvre la console du navigateur ou vérifie les logs du serveur.
