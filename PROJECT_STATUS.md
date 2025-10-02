# État du projet — Todo Collaboratif

**Dernière mise à jour** : 2 octobre 2025  
**Version** : 1.5.0  
**Statut** : ✅ Backend opérationnel, migration shadcn/ui en cours

---

## Architecture

### Stack technique
- **Frontend** : React 18 + Vite + TailwindCSS + shadcn/ui
- **Backend** : Node.js + Express + Socket.IO
- **Base de données** : SQLite (Prisma ORM)
- **Temps réel** : WebSockets (Socket.IO)
- **Extensions** : Outlook Add-in (Office.js)

### Structure du projet
```
kanban/
├── client/                    # Frontend React
│   ├── src/
│   │   ├── components/        # Composants React
│   │   │   ├── ui/           # shadcn/ui components
│   │   │   ├── Dashboard.jsx (ancien)
│   │   │   ├── DashboardClean.jsx (nouveau, shadcn/ui)
│   │   │   ├── TaskList.jsx
│   │   │   ├── TaskForm.jsx
│   │   │   ├── UserManagement.jsx
│   │   │   ├── AdminPanel.jsx
│   │   │   ├── Analytics.jsx
│   │   │   ├── MeetingMode.jsx
│   │   │   ├── CalendarModal.jsx
│   │   │   └── ...
│   │   ├── hooks/            # Custom hooks
│   │   │   ├── useTasks.js
│   │   │   ├── usePublicTasks.js
│   │   │   ├── useUsers.js
│   │   │   └── useSocket.js
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js        # Alias @ configuré
│
├── server/                    # Backend Express
│   ├── src/
│   │   ├── routes/
│   │   │   ├── tasks.js      # ✅ CRUD + visibilité + claim + history
│   │   │   ├── users.js
│   │   │   ├── auth.js
│   │   │   ├── admin.js
│   │   │   ├── ical.js       # ✅ Export calendrier .ics
│   │   │   └── attachments.js
│   │   ├── services/
│   │   │   ├── notifications.js  # ✅ Email (Nodemailer)
│   │   │   ├── recurring.js      # ✅ Tâches récurrentes (RRule)
│   │   │   └── cloudinary.js     # Upload fichiers
│   │   ├── utils/
│   │   │   └── auditLog.js       # ✅ Historique des modifications
│   │   ├── server.js         # ✅ Express + Socket.IO
│   │   └── seed.js           # ✅ Seed de données de test
│   ├── prisma/
│   │   ├── schema.prisma     # ✅ Modèle complet (Task, User, Comment, AuditLog, Attachment)
│   │   └── migrations/       # ✅ add_owner_public_fields appliqué
│   └── package.json
│
├── outlook-addin/             # Extension Outlook
│   ├── manifest.xml          # ✅ Manifeste Office
│   ├── taskpane.html         # ✅ Interface de création de tâche
│   └── README.md
│
├── MIGRATION_SHADCN.md       # Guide migration shadcn/ui
├── OUTLOOK_EXTENSION.md      # Guide extension Outlook
├── PROJECT_STATUS.md         # Ce fichier
└── package.json              # Scripts concurrently
```

---

## Fonctionnalités implémentées

### ✅ Core (Tâches)
- [x] CRUD complet (Create, Read, Update, Delete)
- [x] Statuts : todo, doing, done
- [x] Priorités : low, medium, high, urgent
- [x] Date limite (dueDate)
- [x] Assignation (assigneeId)
- [x] Propriétaire (ownerId) — relation nommée
- [x] Commentaires avec auteur
- [x] Temps réel (Socket.IO : task:created, task:updated, task:deleted)

### ✅ Public/Privé
- [x] `isPublic` toggle pour afficher les tâches sur le dashboard public
- [x] `publicSummary` pour masquer les titres sensibles
- [x] Endpoint `GET /api/tasks/public` (safe fields uniquement)
- [x] Endpoint `PATCH /api/tasks/:id/visibility` (owner-only)
- [x] Hook `useTasks.setTaskVisibility(taskId, { isPublic, publicSummary })`
- [x] Hook `usePublicTasks()` avec Socket refresh (`tasks:public_updated`)

### ✅ Utilisateurs
- [x] Login simple (nom + avatar emoji)
- [x] Gestion des utilisateurs (UserManagement.jsx)
- [x] Statut en ligne (isOnline via Socket.IO)
- [x] Rôle admin (`isAdmin`)
- [x] Notifications par email (preferences: `notifyOnAssign`, `notifyOnComplete`, `notifyOnComment`)

### ✅ Approbation client
- [x] `clientApproval` enum (none, pending, approved, rejected)
- [x] `approvalComment` pour justifier refus/validation
- [x] Workflow : owner demande approbation → client valide → assignee exécute

### ✅ Tâches récurrentes
- [x] `isRecurring` flag
- [x] `recurrenceRule` (RRULE format RFC 5545)
- [x] `parentTaskId` pour lier instances à la tâche récurrente
- [x] Service `recurring.js` avec scheduler (génération automatique d'instances)
- [x] Patterns : daily, weekly, biweekly, monthly, yearly, weekdays

### ✅ Audit & Historique
- [x] Modèle `AuditLog` (taskId, userId, action, field, oldValue, newValue)
- [x] Tracking des changements : status, assignee, priority, dueDate, isPublic, clientApproval
- [x] Endpoint `GET /api/tasks/:id/history`
- [x] Composant `HistoryPanel.jsx` (affichage timeline)

### ✅ Notifications Email
- [x] Service `notifications.js` (Nodemailer)
- [x] Providers : dev (SMTP local), Postmark, SendGrid
- [x] Triggers :
  - Assignation de tâche
  - Tâche marquée comme terminée
  - Nouveau commentaire
  - Rappel échéance J-1 (CRON à implémenter)

### ✅ Export & Calendrier
- [x] Export JSON (`GET /api/users/export`)
- [x] Export CSV (frontend, `exportCSV()` dans App.jsx)
- [x] Calendrier .ics (`GET /api/calendar/:userId.ics`)
- [x] Abonnement Outlook/iPhone/Google Calendar
- [x] Composant `CalendarModal.jsx` (instructions d'abonnement)

### ✅ Fichiers joints
- [x] Modèle `Attachment` (taskId, uploaderId, fileName, fileType, fileSize, url, publicId)
- [x] Service `cloudinary.js` (upload Cloudinary)
- [x] Route `POST /api/tasks/:id/attachments` (upload)
- [x] Route `DELETE /api/attachments/:id` (suppression)
- [x] Composant `FileUpload.jsx`

### ✅ Dashboard public
- [x] Dashboard.jsx (ancien, couleurs vives)
- [x] DashboardClean.jsx (nouveau, shadcn/ui monochrome)
- [x] KPIs : total tâches, taux complétion, en retard, membres actifs
- [x] Barre de progression globale
- [x] Liste des tâches actives (lecture seule)
- [x] Claim task (bouton "Prendre en charge" pour tâches non assignées)

### ✅ Administration
- [x] AdminPanel.jsx (gestion utilisateurs, stats, configuration)
- [x] Route `POST /api/admin/toggle-admin` (promouvoir/rétrograder admin)
- [x] Protection des routes admin (middleware à implémenter si besoin)

### ✅ Analytics
- [x] Analytics.jsx (graphiques de productivité, tendances, etc.)
- [x] Métriques : tâches créées/complétées par jour, répartition par priorité, temps moyen de complétion

### ✅ Mode réunion
- [x] MeetingMode.jsx (affichage plein écran des tâches pour réunions/standup)
- [x] Vue kanban/liste optimisée pour projection

### ✅ Paramètres utilisateur
- [x] UserSettings.jsx (préférences de notifications, email, avatar)
- [x] Route `PATCH /api/users/:id` (mise à jour profil)

### ✅ Extension Outlook
- [x] manifest.xml (configuration Office Add-in)
- [x] taskpane.html (interface de création de tâche depuis email)
- [x] Intégration Office.js (extraction sujet, corps, expéditeur)
- [x] Documentation complète (OUTLOOK_EXTENSION.md)

---

## Migration shadcn/ui

### ✅ Configuration
- [x] shadcn/ui installé (`npx shadcn@latest init`)
- [x] Composants de base ajoutés : button, card, input, label, select, checkbox, textarea, badge, separator, dialog, dropdown-menu
- [x] Alias `@/` configuré (vite.config.js + jsconfig.json)
- [x] Variables CSS monochromes (index.css)

### ✅ Composants migrés
- [x] DashboardClean.jsx (nouveau, référence shadcn/ui)

### ⏳ Composants à migrer
- [ ] TaskList.jsx
- [ ] TaskForm.jsx
- [ ] UserManagement.jsx
- [ ] AdminPanel.jsx
- [ ] Analytics.jsx
- [ ] CalendarModal.jsx
- [ ] UserSettings.jsx
- [ ] CommentSection.jsx
- [ ] FileUpload.jsx
- [ ] HistoryPanel.jsx

**Référence** : Voir `MIGRATION_SHADCN.md`

---

## Endpoints API

### Tasks
- `GET /api/tasks` — Liste toutes les tâches (app privée)
- `GET /api/tasks/public` — Liste tâches publiques (dashboard)
- `POST /api/tasks` — Créer une tâche
- `PATCH /api/tasks/:id` — Mettre à jour une tâche
- `DELETE /api/tasks/:id` — Supprimer une tâche
- `POST /api/tasks/:id/comments` — Ajouter un commentaire
- `PATCH /api/tasks/:id/visibility` — Toggle visibilité public/privé
- `GET /api/tasks/:id/history` — Historique des modifications
- `POST /api/tasks/:id/claim` — Prendre en charge une tâche publique (non-auth)
- `POST /api/tasks/:id/attachments` — Upload fichier
- `DELETE /api/attachments/:id` — Supprimer fichier

### Users
- `GET /api/users` — Liste utilisateurs
- `POST /api/users` — Créer utilisateur (login)
- `GET /api/users/:id` — Détails utilisateur
- `PATCH /api/users/:id` — Mettre à jour profil
- `DELETE /api/users/:id` — Supprimer utilisateur
- `GET /api/users/export` — Export JSON

### Admin
- `POST /api/admin/toggle-admin` — Toggle statut admin

### Auth
- `POST /api/auth/login` — Login
- `POST /api/auth/logout` — Logout
- `PATCH /api/auth/profile` — Mise à jour profil

### Calendar
- `GET /api/calendar/:userId.ics` — Abonnement calendrier

---

## Base de données (Prisma schema)

### Modèles
- **Task** : id, title, status, dueDate, assigneeId, ownerId, isPublic, publicSummary, isRecurring, recurrenceRule, parentTaskId, priority, clientApproval, approvalComment, createdAt, updatedAt
- **User** : id, name, password, avatar, isOnline, isAdmin, email, notifyOnAssign, notifyOnComplete, notifyOnComment
- **Comment** : id, content, taskId, authorId, createdAt
- **Attachment** : id, taskId, uploaderId, fileName, fileType, fileSize, url, publicId, createdAt
- **AuditLog** : id, taskId, userId, action, field, oldValue, newValue, createdAt

### Relations
- `User.ownedTasks` ← `Task.owner` (relation "OwnedTasks")
- `User.assignedTasks` ← `Task.assignee` (relation "AssignedTasks")
- `User.comments` ← `Comment.author`
- `User.auditLogs` ← `AuditLog.user`
- `User.attachments` ← `Attachment.uploader`
- `Task.comments` ← `Comment.task`
- `Task.auditLogs` ← `AuditLog.task`
- `Task.attachments` ← `Attachment.task`
- `Task.childTasks` ← `Task.parentTask` (récurrence)

---

## Déploiement

### Développement local
```bash
# Backend
cd server
npm install
npx prisma generate
npx prisma migrate dev
node src/seed.js
npm run dev  # Port 3001

# Frontend
cd client
npm install
npm run dev  # Port 5173+ (Vite choisit automatiquement)
```

### Production (cPanel todo.rauwers.cloud)
```bash
# Backend
cd server
npm install --production
npx prisma generate
npx prisma migrate deploy
node src/server.js  # PM2 ou Node.js App dans cPanel

# Frontend
cd client
npm install
npm run build
# Copier dist/ vers /home/rauwers/public_html/

# Extension Outlook
# Copier outlook-addin/* vers /home/rauwers/public_html/outlook/
```

**URL de production** :
- App : https://todo.rauwers.cloud
- Dashboard public : https://todo.rauwers.cloud/dashboard
- Extension Outlook : https://todo.rauwers.cloud/outlook/manifest.xml

---

## Tests & Validation

### ✅ Testé et fonctionnel
- [x] Backend démarre sans erreur (port 3001)
- [x] Prisma migrations appliquées (add_owner_public_fields)
- [x] Seed de données fonctionne
- [x] Endpoint `/api/tasks/public` retourne les tâches publiques
- [x] Socket.IO connecte et émet des événements
- [x] Frontend Vite démarre (port 5176, proxy /api et /socket.io configurés)

### ⏳ À tester
- [ ] Création de tâche via frontend
- [ ] Toggle visibilité public/privé
- [ ] Claim task (dashboard public)
- [ ] Upload de fichiers (Cloudinary)
- [ ] Notifications email (SMTP dev/Postmark/SendGrid)
- [ ] Tâches récurrentes (génération automatique d'instances)
- [ ] Export CSV
- [ ] Calendrier .ics (abonnement Outlook/iPhone)
- [ ] Extension Outlook (sideload + création de tâche)
- [ ] Dark mode (shadcn/ui)
- [ ] Responsive mobile

---

## Prochaines étapes

### Priorité 1 — Migration shadcn/ui
1. Migrer TaskList.jsx → Utiliser Card, Badge, Button, Checkbox
2. Migrer TaskForm.jsx → Utiliser Input, Textarea, Select, Label, Button, Dialog
3. Remplacer toutes les couleurs custom (blue-500, green-600, etc.) par variables CSS monochromes
4. Tester le dark mode sur tous les composants
5. Supprimer Dashboard.jsx ancien, garder uniquement DashboardClean.jsx

### Priorité 2 — Extension Outlook
1. Créer les icônes (16x16, 32x32, 64x64, 80x80, 128x128)
2. Implémenter l'authentification dans taskpane.html
3. Tester sideload en local (Outlook Desktop + Web)
4. Déployer sur cPanel
5. Tester en production
6. Documenter pour utilisateurs finaux

### Priorité 3 — Notifications & CRON
1. Configurer SMTP (dev : Mailtrap, prod : Postmark)
2. Tester email d'assignation
3. Tester email de complétion
4. Tester email de commentaire
5. Implémenter CRON pour rappel J-1 deadline (node-cron ou cPanel Cron Job)

### Priorité 4 — PWA
1. Créer manifest.json (icons, theme_color, start_url)
2. Ajouter service worker (vite-plugin-pwa ou Workbox)
3. Cache statique (HTML/CSS/JS)
4. Tester installation sur mobile (iPhone/Android)

### Priorité 5 — Tests automatisés
1. Tests unitaires (Vitest pour composants React)
2. Tests d'intégration (API endpoints avec Supertest)
3. Tests E2E (Playwright pour workflows critiques)

---

## Dépendances clés

### Frontend
- **react** : 18.2.0
- **react-router-dom** : 6.20.1
- **socket.io-client** : 4.7.5
- **lucide-react** : 0.294.0 (icônes)
- **date-fns** : 2.30.0 (dates)
- **tailwindcss** : 3.3.6
- **shadcn/ui** : Latest (composants)

### Backend
- **express** : 4.18.2
- **socket.io** : 4.7.5
- **@prisma/client** : 6.14.0
- **nodemailer** : 7.0.6 (emails)
- **rrule** : 2.8.1 (tâches récurrentes)
- **ical-generator** : 9.0.0 (export .ics)
- **cloudinary** : 2.7.0 (upload fichiers)
- **bcryptjs** : 2.4.3 (hash password)
- **multer** : 2.0.2 (upload multipart)

---

## Contributeurs
- Mohammed (développeur principal)

---

## Licence
Propriétaire — Tous droits réservés

---

## Contact & Support
- **URL** : https://todo.rauwers.cloud
- **Email** : support@rauwers.cloud (à configurer)
- **Documentation** : Voir fichiers .md à la racine du projet
