# Configuration de déploiement - Task Manager

## 🌐 Domaine de production
**https://task-manager.digitaldream.work**

## 📧 Email de contact
**dev@digitaldream.work**

## ⚙️ Variables d'environnement CapRover

### Configuration minimale (OBLIGATOIRE)
```bash
NODE_ENV=production
PORT=80
CLIENT_URL=https://task-manager.digitaldream.work
DATABASE_URL=file:/app/data/dev.db
CORS_ORIGINS=https://task-manager.digitaldream.work
```

### Cloudinary (Upload de fichiers - OPTIONNEL)
```bash
CLOUDINARY_CLOUD_NAME=votre_cloud_name
CLOUDINARY_API_KEY=votre_api_key
CLOUDINARY_API_SECRET=votre_api_secret
```

### Email (Notifications - OPTIONNEL)
```bash
EMAIL_PROVIDER=dev
EMAIL_FROM=dev@digitaldream.work

# SMTP custom
SMTP_HOST=smtp.example.com
SMTP_PORT=587

# OU Postmark
POSTMARK_API_TOKEN=votre_token

# OU SendGrid
SENDGRID_API_KEY=votre_key
```

## 🔧 Configuration CapRover

### 1. Persistent Directory
- **Path in App:** `/app/data`
- **Label:** `task-manager-db`

### 2. SSL & WebSocket
- ✅ Enable HTTPS
- ✅ Force HTTPS  
- ✅ Websocket Support (crucial pour Socket.IO)

### 3. Container Health Check
Déjà configuré dans le Dockerfile :
- Endpoint: `/health`
- Interval: 30s
- Timeout: 10s
- Start period: 60s

## 🚀 Commandes de déploiement

```bash
# Méthode rapide (script automatisé)
./deploy.sh

# Méthode manuelle
caprover deploy
```

## 📋 Checklist pré-déploiement

- [ ] Variables d'environnement configurées dans CapRover
- [ ] Persistent Directory `/app/data` configuré
- [ ] Websocket Support activé
- [ ] HTTPS activé et forcé
- [ ] Credentials Cloudinary ajoutés (si upload de fichiers nécessaire)
- [ ] Configuration email ajoutée (si notifications nécessaires)

## 🌐 URLs de l'application

- **Application principale:** https://task-manager.digitaldream.work
- **API:** https://task-manager.digitaldream.work/api
- **Health Check:** https://task-manager.digitaldream.work/health
- **WebSocket:** wss://task-manager.digitaldream.work
- **Outlook Add-in:** https://task-manager.digitaldream.work/outlook/manifest.xml

## 📦 Versions

- **Node.js:** 20-alpine
- **Base de données:** SQLite (persistante)
- **Framework:** React 18 + Express + Socket.IO
- **ORM:** Prisma 6.14

## 🔐 Sécurité

- Helmet.js pour headers sécurisés
- CORS configuré et restrictif
- Rate limiting: 100 requêtes / 15 minutes par IP
- Sanitization automatique des inputs
- Compression gzip
- HTTPS forcé

## 📞 Support

En cas de problème:
1. Vérifier les logs CapRover: **App > Logs**
2. Vérifier le health check: `/health`
3. Contacter: **dev@digitaldream.work**
