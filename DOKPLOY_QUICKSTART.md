# 🚀 FlowSpaces - Dokploy Quickstart

## ⚡ Déploiement en 5 Étapes (15 minutes)

### 1️⃣ Préparer le code (2 min)

```bash
# Sur ta machine local
cd /chemin/vers/kanban

# Vérifier que tout est OK
npm run setup        # Si première fois
git status          # Pas de changements non commités

# Commit et push
git add -A
git commit -m "🚀 Deploy: FlowSpaces v1.0 - Phase test public"
git push origin main
```

### 2️⃣ Ouvrir Dokploy Dashboard (1 min)

```
http://85.121.48.53:3000
```

**Note**: Si première fois, setup admin account

### 3️⃣ Créer l'Application (5 min)

#### 3.a Créer le Projet

- **Projects** → **+ Create Project**
- **Nom**: `FlowSpaces`
- **Description**: `Collaborative Task Manager`
- Clic **Create**

#### 3.b Ajouter l'Application

Dans le projet FlowSpaces:
- **+ Add** → **Application**
- **Source**: `GitHub`
- **Repository**: Selectionner ton repo `kanban`
- **Branch**: `main`
- **Build Type**: `Dockerfile`
- Clic **Next**

#### 3.c Configuration

**Environment**:
```env
NODE_ENV=production
PORT=3001
CLIENT_URL=https://www.TON_DOMAINE.COM
DATABASE_URL=file:/app/data/dev.db
CORS_ORIGINS=https://www.TON_DOMAINE.COM,https://TON_DOMAINE.COM
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EMAIL_PROVIDER=dev
EMAIL_FROM=noreply@TON_DOMAINE.COM
```

**Volumes**:
- Mount Path: `/app/data`
- Volume Name: `flowspaces-db`

**Domains**:
- Domain: `www.TON_DOMAINE.COM`
- Port: `3001`
- HTTPS: ✅ Enabled
- (Optionnel) Add: `TON_DOMAINE.COM`

### 4️⃣ Déployer (5 min)

- Clic **Deploy**
- Attendre les logs (5-10 min)
- Logs affichent la progression

### 5️⃣ Vérifier (2 min)

```bash
# Test 1: Health check
curl https://www.TON_DOMAINE.COM/health

# Test 2: Frontend
# Ouvrir: https://www.TON_DOMAINE.COM
# Doit voir interface

# Test 3: Login
# Tester créer utilisateur / login
```

---

## 📊 Architecture Dokploy

```
┌─────────────────────────────────────────────┐
│  Navigateur (HTTPS)                        │
│  ↓                                          │
│  Dokploy Traefik (Port 80/443)             │
│  ├─ HTTPS + Let's Encrypt Certs           │
│  ├─ WebSocket Support                      │
│  └─ Rate Limiting                          │
│  ↓                                          │
│  Docker Container FlowSpaces                │
│  ├─ Node.js + Express                      │
│  ├─ Vite + React Frontend                  │
│  └─ Socket.IO (WebSocket)                  │
│  ↓                                          │
│  Volume: /app/data (SQLite DB)             │
│  └─ Persiste entre redéploiements         │
└─────────────────────────────────────────────┘
```

---

## 🔒 Sécurité Incluse

| Feature | Dokploy | App | VPS |
|---------|---------|-----|-----|
| **HTTPS/SSL** | ✅ Auto | - | ✅ |
| **Rate Limit** | ✅ Traefik | ✅ Express | - |
| **Headers Sécurité** | - | ✅ Helmet | - |
| **Firewall** | - | - | ✅ UFW |
| **WebSocket** | ✅ Upgrade | ✅ Socket.IO | - |

---

## 📝 Env Variables Expliquées

```env
# App
NODE_ENV=production          # Production mode
PORT=3001                    # Port interne (Traefik fait le reverse proxy)

# URLs
CLIENT_URL=https://www...    # IMPORTANT: Full HTTPS URL
CORS_ORIGINS=https://www...  # CORS whitelist

# Database
DATABASE_URL=file:/...       # SQLite interne (persiste via volume)

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000  # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100  # 100 req par fenêtre

# Email (dev = aucun envoi)
EMAIL_PROVIDER=dev
EMAIL_FROM=noreply@...
```

---

## 🐛 Dépannage Courant

### ❌ Deployment échoue

**Logs disponibles dans Dokploy Dashboard → Application → Logs**

Causes courantes:
- ❌ Dockerfile ne build pas → Vérifier `docker build .` localement
- ❌ Env vars manquantes → Ajouter dans Environment tab
- ❌ Volume pas monté → Vérifier Mount Path = `/app/data`

### ❌ HTTPS pas actif

- Vérifier que domaine DNS pointe vers `85.121.48.53`
- Wait 5-10min pour Let's Encrypt
- Check Dokploy Logs pour certificat errors

### ❌ WebSocket échoue

- DevTools → Network → WS tab
- Doit voir `socket.io` handshake
- Si ❌: Vérifier Traefik upgrade headers

### ❌ Base données vide

```bash
# SSH sur VPS
ssh -i KEY root@85.121.48.53

# Trouver container
docker ps | grep flowspaces

# Entrer container
docker exec -it CONTAINER_ID sh

# À l'intérieur du container
cd server
npx prisma db push    # Crée schema
node src/seed.js      # Remplit data
exit
```

---

## 🔄 Updates Post-Deploy

### Après Test Public: Avant Production

1. **PostgreSQL** (si besoin 1000+ users)
   - Dokploy → Services → + PostgreSQL
   - Update `DATABASE_URL=postgresql://...`
   - Redeploy

2. **Email Réel** (pour notifications)
   - Update `EMAIL_PROVIDER=postmark`
   - Add `POSTMARK_API_TOKEN=...`

3. **Cloudinary** (pour uploads fichiers)
   - Add env vars Cloudinary
   - Test upload via UI

4. **Monitoring**
   - Uptime Kuma: http://85.121.48.53:3002
   - Add monitor: `https://www.TON_DOMAINE.COM/health`

---

## 📊 Monitoring

### Health Check

```bash
# Doit retourner {"status":"OK"...}
curl https://www.TON_DOMAINE.COM/health
```

### Logs Real-Time

```bash
# Option 1: Dokploy Dashboard
# Application → Logs (onglet)

# Option 2: SSH
ssh -i KEY root@85.121.48.53
docker logs -f $(docker ps -q -f "name=flowspaces")
```

### Uptime Kuma

1. Ouvrir http://85.121.48.53:3002
2. Add Monitor:
   - Type: HTTPS
   - URL: https://www.TON_DOMAINE.COM/health
   - Interval: 60s

---

## ✅ Checklist Quickstart

- [ ] Code sur GitHub (main branch)
- [ ] Dokploy accessible (http://85.121.48.53:3000)
- [ ] Projet `FlowSpaces` créé
- [ ] Application créée (GitHub source)
- [ ] Env vars configurées
- [ ] Volume `/app/data` monté
- [ ] Domaine configuré (DNS A record → 85.121.48.53)
- [ ] HTTPS enabled
- [ ] **DEPLOY** cliqué
- [ ] Logs montrent success
- [ ] Health check OK: `curl https://..../health`
- [ ] Frontend charge: `https://....`
- [ ] WebSocket connecté (DevTools WS tab)
- [ ] Monitoring add Uptime Kuma

---

## 🎯 URLs Importantes

| Service | URL |
|---------|-----|
| **App** | https://www.TON_DOMAINE.COM |
| **Health** | https://www.TON_DOMAINE.COM/health |
| **Dokploy** | http://85.121.48.53:3000 |
| **Uptime Kuma** | http://85.121.48.53:3002 |

---

## 💡 Tips

1. **Webhook Auto-Deploy**
   - Dokploy → App → Webhooks
   - Copy URL → GitHub Webhooks
   - Auto redeploy on `git push`

2. **Database Backup**
   - Backup important!
   - SSH: `docker cp CONTAINER:/app/data/dev.db ./backup.db`

3. **Logs Debug**
   - Problème? Check Dokploy Logs
   - Très informatif

4. **Redeploy Fast**
   - Dokploy Dashboard → Redeploy button
   - Garder config, refait juste build

---

**🎉 C'est bon! Ton app est live sur Dokploy!**

**Prochaines étapes**:
- Test en public
- Collecter feedback
- Migration PostgreSQL si besoin
- Activer email SMTP
- Configurer Cloudinary
