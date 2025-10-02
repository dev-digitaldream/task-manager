# Déploiement CapRover - Task Manager

## 🚀 Étapes de déploiement

### 1. Préparer le projet

Le projet utilise Docker multi-stage build avec Node 20 et SQLite persistant.

### 2. Variables d'environnement CapRover

Dans CapRover, allez dans **App Configs > Environmental Variables** et ajoutez :

#### Variables obligatoires :
```bash
NODE_ENV=production
PORT=80
CLIENT_URL=https://task-manager.digitaldream.work
DATABASE_URL=file:/app/data/dev.db
CORS_ORIGINS=https://task-manager.digitaldream.work
```

#### Variables optionnelles (Cloudinary pour les fichiers) :
```bash
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

#### Variables optionnelles (Email) :
```bash
EMAIL_PROVIDER=dev
EMAIL_FROM=dev@digitaldream.work

# Si SMTP
SMTP_HOST=smtp.example.com
SMTP_PORT=587

# Si Postmark
POSTMARK_API_TOKEN=votre_token

# Si SendGrid
SENDGRID_API_KEY=votre_key
```

### 3. Persistent Data (Important !)

CapRover doit persister `/app/data` pour sauvegarder la base SQLite.

Dans **App Configs > Persistent Directories**, ajoutez :
```
Path in App: /app/data
Label: task-manager-db
```

### 4. Build & Deploy

#### Option A : Via Git (Recommandé)
```bash
# Depuis votre machine locale
git add .
git commit -m "Deploy to CapRover"
git push origin main

# Déployer
caprover deploy
```

#### Option B : Via tarball
```bash
# Créer un tarball du projet
tar -czf deploy.tar.gz --exclude=node_modules --exclude=.git .

# Uploader via CapRover UI
# App > Deployment > Upload Tarball
```

### 5. Configuration SSL

Dans CapRover :
- **Enable HTTPS** : ✅ Activé
- **Force HTTPS** : ✅ Activé
- **Websocket Support** : ✅ Activé (important pour Socket.IO)

### 6. Vérification

Après le déploiement :

1. **Health Check** : `https://task-manager.digitaldream.work/health`
2. **Application** : `https://task-manager.digitaldream.work`
3. **Logs** : Vérifier dans CapRover > App Logs

### 7. Base de données initiale

Le script `start.sh` s'occupe automatiquement de :
- Créer la base SQLite si elle n'existe pas
- Appliquer le schéma Prisma
- Insérer les données de démonstration

### 8. Monitoring

Le Dockerfile inclut un health check automatique qui ping `/health` toutes les 30s.

## 🔧 Dépannage

### Build qui échoue
- Vérifier que Node 20 est utilisé
- Vérifier que `start.sh` a les bonnes permissions (chmod +x)

### WebSocket ne fonctionne pas
- Activer **Websocket Support** dans CapRover
- Vérifier CORS_ORIGINS

### Base de données perdue
- Vérifier que le Persistent Directory `/app/data` est configuré

### Upload de fichiers échoue
- Vérifier les credentials Cloudinary
- Limites : 10MB max par fichier

## 📦 Structure de déploiement

```
/app/
├── server/          # Backend Node.js
│   ├── src/
│   ├── prisma/
│   └── node_modules/
├── data/           # ⚠️ PERSISTENT - Base SQLite
│   └── dev.db
└── start.sh        # Script de démarrage
```

## 🌐 URLs importantes

- **App principale** : https://task-manager.digitaldream.work
- **API** : https://task-manager.digitaldream.work/api
- **WebSocket** : wss://task-manager.digitaldream.work
- **Health** : https://task-manager.digitaldream.work/health
- **Outlook Add-in** : https://task-manager.digitaldream.work/outlook/manifest.xml

## 🔐 Sécurité

Le serveur inclut :
- Helmet.js (Headers sécurisés)
- CORS configuré
- Rate limiting (100 req/15min par IP)
- Sanitization des inputs
- Compression gzip
