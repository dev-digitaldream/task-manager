# 🚀 Déploiement CapRover - todo.digitaldream.work

Guide complet pour déployer une nouvelle instance Task Manager sur CapRover pour les tests internes.

---

## 📋 Informations du Déploiement

**Nouvelle instance** : `todo.digitaldream.work` (tests internes)
**Instance existante** : `task-manager.digitaldream.work` (démo clients)
**Serveur** : 191.96.11.125
**Plateforme** : CapRover

---

## 🔐 Sécurité : Variables d'Environnement

**⚠️ IMPORTANT** : Ne jamais commiter les credentials dans Git !

Créez un fichier `.env.caprover` (à NE PAS commiter) :

```bash
# Server CapRover SSH
CAPROVER_SERVER=191.96.11.125
CAPROVER_USER=root

# App CapRover
CAPROVER_APP_NAME=todo-digitaldream
CAPROVER_DOMAIN=todo.digitaldream.work

# Database
DATABASE_URL=file:./data/todo.db

# API
NODE_ENV=production
PORT=3001
CLIENT_URL=https://todo.digitaldream.work

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# CORS
CORS_ORIGINS=https://todo.digitaldream.work,https://outlook.office.com,https://outlook.office365.com,https://outlook.live.com
```

---

## 📦 Étape 1 : Préparer le Projet

### 1.1 Vérifier les Fichiers Corrigés

```bash
cd /Volumes/ExtremeSSD/projetcs/kanban

# Vérifier que les corrections sont présentes
cat server/src/middleware/security.js | grep "outlook.office.com"
# ✅ Doit afficher les domaines Outlook

cat outlook-addin/manifest.json | grep "99a09b40-9d5c-406a-96cc"
# ✅ Doit afficher le nouveau GUID
```

### 1.2 Créer le Dockerfile pour CapRover

**Vérifiez** que `Dockerfile.caprover` existe :

```bash
ls -la Dockerfile.caprover
```

Si non, créez-le :

```dockerfile
# Multi-stage build for Task Manager - CapRover optimized
FROM node:18-alpine AS base

# Stage 1: Install dependencies
FROM base AS dependencies
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Install all dependencies
RUN npm ci && \
    cd server && npm ci && \
    cd ../client && npm ci

# Stage 2: Build client
FROM dependencies AS build-client
WORKDIR /app/client

COPY client/ ./
RUN npm run build

# Stage 3: Build server
FROM base AS build-server
WORKDIR /app/server

COPY server/ ./
COPY --from=dependencies /app/server/node_modules ./node_modules

# Generate Prisma client
RUN npx prisma generate

# Stage 4: Production
FROM base AS production
WORKDIR /app

# Install production dependencies only
COPY server/package*.json ./
RUN npm ci --only=production

# Copy built files
COPY --from=build-server /app/server/ ./
COPY --from=build-client /app/client/dist ./public
COPY outlook-addin ./outlook-addin

# Create data directory for SQLite
RUN mkdir -p /app/data && chmod 777 /app/data

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3001/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start server
CMD ["node", "src/server.js"]
```

### 1.3 Créer captain-definition

```bash
cat > captain-definition << 'EOF'
{
  "schemaVersion": 2,
  "dockerfilePath": "./Dockerfile.caprover"
}
EOF
```

---

## 🌐 Étape 2 : Connexion à CapRover

### 2.1 Installer CapRover CLI (si pas déjà fait)

```bash
npm install -g caprover
```

### 2.2 Se Connecter au Serveur

```bash
# Se connecter à CapRover
caprover login

# Suivre les prompts :
# 1. CapRover machine address: https://captain.digitaldream.work
# 2. Password: [Votre mot de passe CapRover]
# 3. Name: digitaldream (ou autre nom)
```

---

## 📱 Étape 3 : Créer la Nouvelle Application

### 3.1 Créer l'App via Interface Web

1. **Ouvrir** : https://captain.digitaldream.work
2. **Se connecter** avec vos credentials
3. **Apps** → **One-Click Apps/Databases** → Create a New App
4. **App Name** : `todo-digitaldream`
5. **Has Persistent Data** : ✅ Coché (pour la base de données SQLite)
6. **Create**

### 3.2 Configurer l'Application

Dans l'app `todo-digitaldream` :

**HTTP Settings** :
- ✅ Enable HTTPS
- ✅ Force HTTPS
- ✅ Websocket Support

**App Configs** :
```bash
# Onglet "App Configs" → "Bulk Edit"

NODE_ENV=production
PORT=3001
CLIENT_URL=https://todo.digitaldream.work
DATABASE_URL=file:/app/data/todo.db
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGINS=https://todo.digitaldream.work,https://outlook.office.com,https://outlook.office365.com,https://outlook.live.com
```

**Persistent Directories** :
```
/app/data
```

**Domain** :
- Ajouter : `todo.digitaldream.work`
- ✅ Enable HTTPS
- ✅ Force HTTPS

---

## 🚀 Étape 4 : Déployer

### 4.1 Déploiement via CLI

```bash
cd /Volumes/ExtremeSSD/projetcs/kanban

# Déployer
caprover deploy

# Suivre les prompts :
# 1. Select your app: todo-digitaldream
# 2. Branch: main (ou votre branche)
# 3. Build path: . (root)
```

### 4.2 Déploiement via Git (Alternative)

```bash
# Ajouter remote CapRover
git remote add caprover-todo ssh://root@191.96.11.125:22/captain-todo-digitaldream

# Déployer
git push caprover-todo main:master
```

### 4.3 Suivre le Déploiement

Dans l'interface CapRover :
1. **Apps** → **todo-digitaldream**
2. **App Logs** : Voir les logs de build et déploiement
3. **Deployment** : Voir le statut

---

## 🗄️ Étape 5 : Initialiser la Base de Données

### 5.1 Accès SSH au Container

```bash
# Via CapRover UI
Apps → todo-digitaldream → "View Shell"

# Ou via SSH direct
ssh root@191.96.11.125
docker exec -it $(docker ps | grep todo-digitaldream | awk '{print $1}') sh
```

### 5.2 Créer le Schéma et Seed

```bash
# Dans le container
cd /app
npx prisma db push
npx prisma db seed

# Vérifier
ls -la /app/data/
# Doit montrer todo.db
```

---

## ✅ Étape 6 : Vérification

### 6.1 Tests de Santé

```bash
# Health check
curl https://todo.digitaldream.work/health

# API Users
curl https://todo.digitaldream.work/api/users

# API Tasks
curl https://todo.digitaldream.work/api/tasks

# Outlook Add-in manifest
curl https://todo.digitaldream.work/outlook/manifest.json
```

### 6.2 Test Web

1. **Ouvrir** : https://todo.digitaldream.work
2. **Vérifier** que l'app se charge
3. **Tester** la création de tâches
4. **Vérifier** le temps réel (WebSocket)

### 6.3 Test Add-in Outlook

1. **Ouvrir** : https://outlook.office.com
2. **Settings** → Manage add-ins
3. **Add from URL** :
   ```
   https://todo.digitaldream.work/outlook/manifest.json
   ```
4. **Tester** la création de tâche depuis un email

---

## 🔧 Étape 7 : Configuration DNS

### 7.1 Ajouter Enregistrement DNS

Dans votre gestionnaire DNS (OVH, Cloudflare, etc.) :

```
Type: A
Name: todo
Value: 191.96.11.125
TTL: 300 (5 min)
```

### 7.2 Vérifier la Propagation

```bash
# Vérifier DNS
dig todo.digitaldream.work

# Ou
nslookup todo.digitaldream.work

# Doit pointer vers 191.96.11.125
```

---

## 📊 Étape 8 : Monitoring et Logs

### 8.1 Voir les Logs en Temps Réel

**Via CapRover UI** :
```
Apps → todo-digitaldream → App Logs
```

**Via CLI** :
```bash
caprover logs --app todo-digitaldream --lines 100 --follow
```

**Via SSH** :
```bash
ssh root@191.96.11.125
docker logs -f $(docker ps | grep todo-digitaldream | awk '{print $1}')
```

### 8.2 Monitoring CapRover

Dans CapRover UI :
- **Monitoring** → Voir CPU, RAM, Disk
- **NetData** : Dashboard complet du serveur

---

## 🔄 Étape 9 : Mises à Jour

### 9.1 Déployer une Nouvelle Version

```bash
# 1. Faire vos modifications
git add .
git commit -m "Update: Description des changements"

# 2. Déployer
caprover deploy

# Ou via Git
git push caprover-todo main:master
```

### 9.2 Rollback si Problème

Via CapRover UI :
```
Apps → todo-digitaldream → Deployment → Previous Versions → Deploy
```

---

## 🐛 Dépannage

### App ne démarre pas

```bash
# 1. Vérifier les logs
caprover logs --app todo-digitaldream

# 2. Vérifier les variables d'env
# CapRover UI → App Configs

# 3. Vérifier le port
# PORT=3001 (doit correspondre au Dockerfile)

# 4. Redémarrer
# CapRover UI → Restart
```

### Base de données perdue après redémarrage

```bash
# Vérifier Persistent Directory
# CapRover UI → Persistent Directories
# Doit contenir : /app/data

# Vérifier permissions
ssh root@191.96.11.125
docker exec -it $(docker ps | grep todo-digitaldream | awk '{print $1}') sh
ls -la /app/data/
chmod 777 /app/data
```

### Erreur SSL/HTTPS

```bash
# Dans CapRover UI
Apps → todo-digitaldream → HTTP Settings
✅ Enable HTTPS
✅ Force HTTPS

# Puis dans Domains
todo.digitaldream.work
✅ Enable HTTPS
```

### WebSocket ne fonctionne pas

```bash
# CapRover UI → App Settings
✅ Websocket Support

# Redémarrer l'app après activation
```

---

## 📋 Checklist Finale

Avant de dire que c'est OK :

**Déploiement** :
- [ ] App déployée sur CapRover
- [ ] HTTPS activé et forcé
- [ ] WebSocket activé
- [ ] Variables d'env configurées
- [ ] Persistent directory configuré
- [ ] DNS configuré (todo.digitaldream.work)

**Fonctionnalités** :
- [ ] API `/health` répond
- [ ] API `/api/users` répond
- [ ] API `/api/tasks` répond
- [ ] Interface web accessible
- [ ] WebSocket fonctionne (temps réel)
- [ ] Add-in Outlook accessible

**Sécurité** :
- [ ] HTTPS uniquement
- [ ] CORS configuré
- [ ] Rate limiting actif
- [ ] Pas de credentials dans Git

**Base de données** :
- [ ] SQLite créée
- [ ] Schema appliqué
- [ ] Users seed créés
- [ ] Données persistent après redémarrage

---

## 🎯 Script de Déploiement Automatique

Créez `deploy-todo.sh` :

```bash
#!/bin/bash

echo "🚀 Déploiement todo.digitaldream.work sur CapRover"
echo "=================================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifications préalables
echo ""
echo "1️⃣ Vérifications préalables..."

if ! command -v caprover &> /dev/null; then
    echo -e "${RED}❌ CapRover CLI non installé${NC}"
    echo "Installation : npm install -g caprover"
    exit 1
fi
echo -e "${GREEN}✅ CapRover CLI installé${NC}"

if [ ! -f "captain-definition" ]; then
    echo -e "${RED}❌ captain-definition non trouvé${NC}"
    exit 1
fi
echo -e "${GREEN}✅ captain-definition trouvé${NC}"

if [ ! -f "Dockerfile.caprover" ]; then
    echo -e "${RED}❌ Dockerfile.caprover non trouvé${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Dockerfile.caprover trouvé${NC}"

# Git status
echo ""
echo "2️⃣ Vérification Git..."
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  Changements non commités détectés${NC}"
    read -p "Voulez-vous continuer ? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Déploiement
echo ""
echo "3️⃣ Déploiement sur CapRover..."
caprover deploy --appName todo-digitaldream

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Déploiement réussi !${NC}"
else
    echo -e "${RED}❌ Déploiement échoué${NC}"
    exit 1
fi

# Tests
echo ""
echo "4️⃣ Tests de santé..."

sleep 10 # Attendre que l'app démarre

if curl -s https://todo.digitaldream.work/health | grep -q "OK"; then
    echo -e "${GREEN}✅ Health check OK${NC}"
else
    echo -e "${RED}❌ Health check échoué${NC}"
fi

if curl -s https://todo.digitaldream.work/api/users > /dev/null; then
    echo -e "${GREEN}✅ API Users OK${NC}"
else
    echo -e "${RED}❌ API Users échoué${NC}"
fi

# Succès
echo ""
echo "=================================================="
echo -e "${GREEN}🎉 Déploiement terminé !${NC}"
echo ""
echo "🌐 Application : https://todo.digitaldream.work"
echo "📧 Add-in Outlook : https://todo.digitaldream.work/outlook/manifest.json"
echo "📊 Logs : caprover logs --app todo-digitaldream --follow"
echo ""
```

```bash
chmod +x deploy-todo.sh
./deploy-todo.sh
```

---

## 📚 Ressources

- [CapRover Documentation](https://caprover.com/docs/)
- [Docker Multi-Stage Builds](https://docs.docker.com/develop/develop-images/multistage-build/)
- [Prisma Deployment](https://www.prisma.io/docs/guides/deployment)

---

**Prêt à déployer ! 🚀**

Une fois déployé, vous aurez :
- ✅ `todo.digitaldream.work` - Version tests internes
- ✅ `task-manager.digitaldream.work` - Version démo clients
- ✅ Isolation complète des données
- ✅ HTTPS + WebSocket
- ✅ Add-in Outlook fonctionnel
