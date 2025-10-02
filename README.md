# Todo Collaboratif

Application de gestion de tâches collaborative en temps réel, conçue pour 5 utilisateurs maximum.

## Fonctionnalités

### ✅ Gestion des tâches
- Création/modification/suppression de tâches
- Assignation à un utilisateur
- Dates limites avec indicateurs visuels
- Statuts : À faire / En cours / Terminé
- Système de commentaires avec timestamp

### 🚀 Collaboration temps réel
- Synchronisation instantanée via WebSocket
- Indication de présence des utilisateurs
- Mise à jour < 100ms

### 📊 Dashboard partagé
- Vue `/dashboard` pour écran commun
- Statistiques en temps réel
- Alertes pour tâches en retard
- Horloge et progression globale

### 🎨 Interface moderne
- Mode sombre persistant
- Design responsive
- Export JSON des données
- Interface intuitive

## Installation

### Développement local

```bash
# Installation complète
npm run setup

# Lancement en mode développement
npm run dev
```

L'application sera accessible sur :
- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Dashboard: http://localhost:5173/dashboard

### Production avec Docker

```bash
# Construction et lancement
docker-compose up -d

# Accès à l'application
# http://localhost:3001
```

### Déploiement CapRover

1. Créer une nouvelle application dans CapRover
2. Activer HTTPS si nécessaire
3. Déployer via Git ou upload du dossier
4. Les données SQLite seront persistées automatiquement

## Stack technique

- **Frontend**: React 18 + Vite + TailwindCSS
- **Backend**: Node.js + Express + Socket.io
- **Base de données**: SQLite avec Prisma ORM
- **Temps réel**: WebSocket (Socket.io)
- **Déploiement**: Docker + CapRover compatible

## Structure du projet

```
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Composants React
│   │   ├── hooks/          # Custom hooks
│   │   └── ...
├── server/                 # Backend Node.js
│   ├── src/
│   │   ├── routes/         # Routes API
│   │   └── server.js       # Point d'entrée
│   └── prisma/             # Schéma base de données
├── Dockerfile              # Configuration Docker
└── docker-compose.yml      # Orchestration
```

## API Endpoints

### Tâches
- `GET /api/tasks` - Liste des tâches
- `POST /api/tasks` - Créer une tâche
- `PATCH /api/tasks/:id` - Modifier une tâche
- `DELETE /api/tasks/:id` - Supprimer une tâche
- `POST /api/tasks/:id/comments` - Ajouter un commentaire

### Utilisateurs
- `GET /api/users` - Liste des utilisateurs
- `POST /api/users` - Créer un utilisateur
- `GET /api/users/export` - Exporter les données

### WebSocket Events
- `user:join` / `user:left` - Connexion/déconnexion
- `task:created` / `task:updated` / `task:deleted` - CRUD tâches
- `users:online` - Utilisateurs connectés

## Configuration

### Variables d'environnement

```bash
# Serveur
PORT=3001
CLIENT_URL=http://localhost:5173
DATABASE_URL=file:./dev.db

# Client
VITE_SERVER_URL=http://localhost:3001
```

### Base de données

Le schéma Prisma est automatiquement initialisé au démarrage. Les données d'exemple incluent 5 utilisateurs par défaut et quelques tâches de démonstration.

## Limitations

- Maximum 5 utilisateurs simultanés
- Base SQLite (recommandé pour < 100 utilisateurs actifs)
- Pas d'authentification complexe (sélection d'utilisateur simple)

## Développement

### Commandes utiles

```bash
# Installation des dépendances
npm run setup

# Lancement développement
npm run dev

# Construction client
npm run build

# Base de données
cd server
npm run db:generate    # Générer le client Prisma
npm run db:push       # Appliquer le schéma
npm run db:seed       # Données d'exemple
```

## Support

Application testée et optimisée pour :
- Chrome/Firefox/Safari (desktop & mobile)
- Connexion temps réel stable
- Performance < 100ms pour les mises à jour
- Déploiement en un clic sur CapRover