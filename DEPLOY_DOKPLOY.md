# 🚀 Déploiement FlowSpaces sur Dokploy

**VPS**: 85.121.48.53  
**Dokploy Dashboard**: http://85.121.48.53:3000  
**Domaine cible**: www.flowspaces.work

---

## 📋 Prérequis

1. ✅ Dokploy installé et fonctionnel
2. ✅ DNS configuré : `www.flowspaces.work` → `85.121.48.53`
3. ✅ Accès SSH : `ssh -i ~/.ssh/dokploy_vps_ed25519 root@85.121.48.53`

---

## 🔧 Étape 1: Configurer le DNS

Chez votre registrar DNS (Cloudflare, OVH, etc.), ajoutez :

```
Type    Nom                 Valeur          TTL
A       flowspaces.work     85.121.48.53    300
A       www                 85.121.48.53    300
CNAME   app                 flowspaces.work 300
```

---

## 📦 Étape 2: Push vers un Git Repository

Dokploy déploie depuis Git. Si ce n'est pas déjà fait :

```bash
# Créer un repo GitHub/GitLab
git remote add origin https://github.com/VOTRE_USER/flowspaces.git

# Commit les derniers changements (dépendances à jour, 0 vulnérabilités)
git add -A
git commit -m "Security: Update all dependencies, 0 vulnerabilities"
git push -u origin main
```

---

## 🎯 Étape 3: Créer l'application dans Dokploy

### 3.1 Se connecter à Dokploy

```
URL: http://85.121.48.53:3000
```

### 3.2 Créer un nouveau projet

1. Clic sur **"Projects"** → **"Create Project"**
2. Nom du projet : `FlowSpaces`
3. Description : `Application de gestion de tâches collaborative`

### 3.3 Ajouter une Application

1. Dans le projet FlowSpaces, clic sur **"Add Resource"** → **"Application"**
2. **Source** : GitHub/GitLab
3. **Repository** : Votre repo FlowSpaces
4. **Branch** : `main`
5. **Build Type** : `Dockerfile`
6. **Dockerfile Path** : `./Dockerfile` (à la racine)

---

## ⚙️ Étape 4: Variables d'environnement

Dans Dokploy, onglet **"Environment"**, ajoutez :

```env
# Application
NODE_ENV=production
PORT=3001

# URLs
CLIENT_URL=https://www.flowspaces.work

# Database (SQLite interne)
DATABASE_URL=file:/app/data/dev.db

# Security
CORS_ORIGINS=https://www.flowspaces.work,https://flowspaces.work

# Email (optionnel)
EMAIL_PROVIDER=dev
EMAIL_FROM=noreply@flowspaces.work

# Cloudinary (optionnel - pour uploads)
# CLOUDINARY_CLOUD_NAME=
# CLOUDINARY_API_KEY=
# CLOUDINARY_API_SECRET=
```

---

## 💾 Étape 5: Volume persistant (CRITIQUE)

Pour que la base de données SQLite persiste entre les redéploiements :

1. Onglet **"Mounts"** ou **"Volumes"**
2. Ajouter un volume :
   - **Type** : Volume
   - **Name** : `flowspaces-data`
   - **Mount Path** : `/app/data`

---

## 🌐 Étape 6: Configurer le domaine

1. Onglet **"Domains"**
2. Clic sur **"Add Domain"**
3. **Domain** : `www.flowspaces.work`
4. **Port** : `3001`
5. **HTTPS** : ✅ Activé (Let's Encrypt automatique)
6. Si vous voulez aussi le domaine nu :
   - Ajouter un second domaine : `flowspaces.work`

---

## 🔌 Étape 7: Activer WebSocket (Socket.IO)

Dans les paramètres avancés ou la config Traefik :

1. S'assurer que le **WebSocket** est activé pour le domaine
2. Dans Dokploy, vérifier que l'option "WebSocket Support" est ON

Si nécessaire, ajouter un label Traefik personnalisé :

```yaml
traefik.http.services.flowspaces.loadbalancer.server.port: 3001
traefik.http.middlewares.flowspaces-headers.headers.customrequestheaders.Connection: keep-alive, Upgrade
```

---

## 🚀 Étape 8: Déployer

1. Clic sur **"Deploy"** ou **"Redeploy"**
2. Dokploy va :

   - Cloner le repo
   - Build le Dockerfile
   - Démarrer le container
   - Configurer Traefik avec SSL

3. Vérifier les logs en temps réel dans l'onglet **"Logs"**

---

## ✅ Étape 9: Vérification

```bash
# Health check
curl https://www.flowspaces.work/health

# Devrait retourner :
# {"status":"OK","timestamp":"2025-12-06T..."}
```

Tester dans le navigateur :

- https://www.flowspaces.work
- https://www.flowspaces.work/dashboard
- https://www.flowspaces.work/outlook/manifest.xml

---

## 📊 Monitoring

Ajoutez FlowSpaces dans **Uptime Kuma** (http://85.121.48.53:3002) :

1. **Add New Monitor**
2. **Type** : HTTP(s)
3. **URL** : `https://www.flowspaces.work/health`
4. **Name** : FlowSpaces
5. **Interval** : 60 secondes

---

## 🔄 Redéploiement automatique (CI/CD)

### Option A: Webhook GitHub

1. Dans Dokploy, copier le **Webhook URL** de l'application
2. Dans GitHub repo → Settings → Webhooks → Add webhook
3. Coller l'URL
4. Events : `push`
5. Chaque push sur `main` déclenchera un redéploiement

### Option B: Manuel

```bash
# Depuis votre Mac
git add -A
git commit -m "Update"
git push

# Puis dans Dokploy : clic sur "Redeploy"
```

---

## 🐛 Dépannage

### Container ne démarre pas

```bash
# SSH sur le VPS
ssh -i ~/.ssh/dokploy_vps_ed25519 root@85.121.48.53

# Voir les logs Docker
docker ps -a
docker logs <container_id>
```

### Base de données vide

```bash
# Entrer dans le container
docker exec -it <container_id> sh

# Vérifier la DB
ls -la /app/data/

# Réinitialiser si nécessaire
cd server && npx prisma db push && node src/seed.js
```

### WebSocket ne fonctionne pas

- Vérifier que le port 3001 est exposé
- Vérifier la config Traefik pour les upgrades WebSocket
- Tester : `curl -i -N -H "Upgrade: websocket" https://www.flowspaces.work/socket.io/`

---

## 📌 URLs finales

| Service          | URL                                                      |
| ---------------- | -------------------------------------------------------- |
| Application      | https://www.flowspaces.work                              |
| Dashboard public | https://www.flowspaces.work/dashboard                    |
| API Health       | https://www.flowspaces.work/health                       |
| Outlook Add-in   | https://www.flowspaces.work/outlook/manifest.xml         |
| iCal Feed        | https://www.flowspaces.work/api/users/{userId}/tasks.ics |

---

## 🎯 Checklist finale

- [ ] DNS configuré (A record → 85.121.48.53)
- [ ] Repo Git à jour (git push)
- [ ] Application créée dans Dokploy
- [ ] Variables d'environnement configurées
- [ ] Volume `/app/data` monté
- [ ] Domaine `www.flowspaces.work` configuré
- [ ] HTTPS activé (Let's Encrypt)
- [ ] Déploiement réussi
- [ ] Health check OK
- [ ] Monitoring ajouté dans Uptime Kuma

---

**🎉 FlowSpaces déployé sur Dokploy !**
