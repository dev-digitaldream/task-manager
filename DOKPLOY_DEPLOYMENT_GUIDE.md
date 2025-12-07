# 🚀 Guide Déploiement Dokploy - FlowSpaces (VPS Phase Test Public)

## 📍 Infos VPS
- **IP**: 85.121.48.53
- **Dokploy Dashboard**: http://85.121.48.53:3000
- **Dokploy API**: Disponible via MCP
- **Uptime Kuma**: http://85.121.48.53:3002 (monitoring)

---

## 🎯 Plan de Déploiement Rapide

### Phase 1: Préparation Git (5 min)

```bash
# 1. Push code sur GitHub
git add -A
git commit -m "🚀 Deploy: FlowSpaces v1.0 - Phase test public"
git push origin main

# 2. Vérifier le repo est public/accessible
```

### Phase 2: Configuration Dokploy (15 min)

Via dashboard Dokploy: http://85.121.48.53:3000

1. **Créer Project**
   - Nom: `FlowSpaces`
   - Description: `Collaborative Task Management Platform`

2. **Add Application**
   - Source: GitHub
   - Repo: `ton_user/kanban`
   - Branch: `main`
   - Build Type: `Dockerfile`
   - Dockerfile: `./Dockerfile`

3. **Environment Variables**
   ```env
   NODE_ENV=production
   PORT=3001
   CLIENT_URL=https://www.TOM_DOMAINE.COM
   DATABASE_URL=file:/app/data/dev.db
   CORS_ORIGINS=https://www.TOM_DOMAINE.COM,https://TOM_DOMAINE.COM
   RATE_LIMIT_WINDOW_MS=900000
   RATE_LIMIT_MAX_REQUESTS=100
   EMAIL_PROVIDER=dev
   EMAIL_FROM=noreply@TOM_DOMAINE.COM
   ```

4. **Volumes**
   - Mount Path: `/app/data`
   - Volume Name: `flowspaces-db`

5. **Domains**
   - Domain 1: `www.TOM_DOMAINE.COM`
   - Domain 2: `TOM_DOMAINE.COM` (optional)
   - HTTPS: ✅ Enabled (Let's Encrypt auto)

6. **Deploy**
   - Clic "Deploy" → Attendre les logs
   - Health check: `curl https://www.TOM_DOMAINE.COM/health`

---

## 🔒 Sécurité pour Phase Test Public

### ✅ Actif dans Dokploy

| Feature | Status | Notes |
|---------|--------|-------|
| **HTTPS/SSL** | ✅ Auto | Let's Encrypt via Traefik |
| **Rate Limiting** | ✅ Config | 100 req/15min par IP |
| **Headers Sécurité** | ✅ Built-in | Helmet.js dans app |
| **CORS** | ✅ Config | Restreint au domaine |
| **Firewall** | ⚠️ VPS-level | UFW sur le VPS |
| **WebSocket** | ✅ Support | Via Traefik upgrade |

### 🟡 À Configurer Après Déploiement

- [ ] Changer seed data (users par défaut)
- [ ] Activer backups DB quotidiens
- [ ] Configurer Uptime Kuma monitoring
- [ ] Tester 2FA optionnel
- [ ] Logs monitoring

### 🔴 À Faire Avant Production

- [ ] Migrer SQLite → PostgreSQL
- [ ] Configurer SMTP réel (Postmark/SendGrid)
- [ ] Intégrer Cloudinary pour uploads
- [ ] Chiffrer API keys en DB
- [ ] Backup automatisé + restore tested

---

## 🧪 Tests Après Déploiement

### 1. Health Check
```bash
curl https://www.TOM_DOMAINE.COM/health
# Devrait retourner: {"status":"OK",...}
```

### 2. Frontend Accessible
```bash
# Ouvrir dans navigateur
https://www.TOM_DOMAINE.COM
# Doit charger interface
```

### 3. WebSocket OK
```bash
# DevTools → Network → WS
# Doit voir connexion Socket.IO
```

### 4. API Basique
```bash
# Créer utilisateur test
curl -X POST https://www.TOM_DOMAINE.COM/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"testuser","password":"Test123!","email":"test@example.com"}'

# Login
curl -X POST https://www.TOM_DOMAINE.COM/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"name":"testuser","password":"Test123!"}'
```

### 5. Rate Limiting
```bash
# Tester 150 requêtes → après ~100 recevoir 429
for i in {1..150}; do
  curl -s https://www.TOM_DOMAINE.COM/api/users
done
```

---

## 📊 Monitoring & Logs

### Logs en Temps Réel (Dokploy Dashboard)

1. Aller à l'application FlowSpaces
2. Onglet "Logs" → Suivre les déploiements

### Logs SSH

```bash
# Se connecter au VPS
ssh -i ~/.ssh/dokploy_vps_ed25519 root@85.121.48.53

# Voir containers
docker ps

# Logs app
docker logs -f <container_id>

# Stats
docker stats
```

### Monitoring Uptime Kuma

1. Ouvrir http://85.121.48.53:3002
2. **Add Monitor**
   - Type: HTTPS
   - URL: https://www.TOM_DOMAINE.COM/health
   - Interval: 60s
   - Name: FlowSpaces Health

---

## 🔄 Mises à Jour

### Redéploiement Automatique (Webhook)

**Option 1: GitHub Webhook** (recommandé)

1. Dans Dokploy Dashboard → App → Webhooks
2. Copier le Webhook URL
3. GitHub Repo → Settings → Webhooks → Add webhook
4. Paste URL → Save
5. À chaque `git push`, Dokploy redéploie auto

**Option 2: Manuel**

```bash
# 1. Push code
git push origin main

# 2. Dans Dokploy Dashboard → Redeploy
# Ou via API/CLI
```

### Procédure Sûre de Mise à Jour

```bash
# Sur ta machine locale
git checkout main
git pull origin main

# Faire tes changements
git add -A
git commit -m "🔧 Feature: [description]"
git push origin main

# Dokploy redéploie auto (ou faire manuellement)
```

---

## ⚠️ Gestion Base de Données

### Backup Quotidien (Via Dokploy)

**Option 1: Script SSH sur le VPS**

```bash
ssh -i ~/.ssh/dokploy_vps_ed25519 root@85.121.48.53 << 'EOF'
# Script backup quotidien
cat > /root/backup-flowspaces.sh << 'BACKUP_EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/root/backups"
mkdir -p $BACKUP_DIR
docker cp $(docker ps -q -f "name=flowspaces"):app/data/dev.db $BACKUP_DIR/dev.db.$DATE.bak
# Garder 7 derniers backups
find $BACKUP_DIR -name "dev.db.*" -mtime +7 -delete
BACKUP_EOF
chmod +x /root/backup-flowspaces.sh

# Ajouter à crontab (quotidien 2h du matin)
(crontab -l 2>/dev/null | grep -v "backup-flowspaces"; echo "0 2 * * * /root/backup-flowspaces.sh") | crontab -
EOF
```

### Restauration Base de Données

```bash
ssh -i ~/.ssh/dokploy_vps_ed25519 root@85.121.48.53 << 'EOF'
# Trouver container
CONTAINER=$(docker ps -q -f "name=flowspaces")

# Restore backup
docker cp /root/backups/dev.db.20250101_020000.bak $CONTAINER:/app/data/dev.db

# Redémarrer
docker restart $CONTAINER
EOF
```

---

## 🚨 Dépannage

### Application ne démarre pas

```bash
# 1. SSH sur VPS
ssh -i ~/.ssh/dokploy_vps_ed25519 root@85.121.48.53

# 2. Voir les logs
docker logs $(docker ps -a -q -f "name=flowspaces")

# 3. Vérifier Dockerfile
# Vérifier que le Dockerfile build correctement
docker build -t test:latest /path/to/project
```

### WebSocket échoue

```bash
# Vérifier Traefik config
docker ps # Trouver le container traefik

# Vérifier logs Traefik
docker logs <traefik_container_id>

# Tester WebSocket direct
curl -i -N -H "Upgrade: websocket" https://www.TOM_DOMAINE.COM/socket.io/
```

### Base de données vide

```bash
# Entrer dans container
docker exec -it $(docker ps -q -f "name=flowspaces") sh

# À l'intérieur:
cd server
npx prisma db push
node src/seed.js
exit
```

### HTTPS ne fonctionne pas

```bash
# Vérifier certificat Let's Encrypt
docker exec -it $(docker ps -q -f "name=traefik") certbot certificates

# Renouveler si nécessaire
docker exec -it $(docker ps -q -f "name=traefik") certbot renew

# Redémarrer Traefik
docker restart <traefik_container_id>
```

---

## 📈 Optimisations Post-Déploiement

### Pour Passer en Production

1. **PostgreSQL**
   ```bash
   # Ajouter service PostgreSQL dans Dokploy
   # Service > Database > PostgreSQL
   DATABASE_URL=postgresql://user:password@postgres:5432/flowspaces
   ```

2. **Cloudinary Uploads**
   ```env
   CLOUDINARY_CLOUD_NAME=xxx
   CLOUDINARY_API_KEY=xxx
   CLOUDINARY_API_SECRET=xxx
   ```

3. **Email SMTP**
   ```env
   EMAIL_PROVIDER=postmark
   POSTMARK_API_TOKEN=xxx
   ```

4. **Performance**
   - Cache CDN Cloudflare
   - Compression gzip
   - Images optimisées
   - Rate limiting ajusté

5. **Monitoring**
   - Uptime Kuma pour health check
   - Logs archivés
   - Alertes incidents
   - Performance metrics

---

## ✅ Checklist Déploiement Dokploy

- [ ] Code poussé sur GitHub (`main` branch)
- [ ] Projekt créé dans Dokploy
- [ ] Application créée (GitHub source)
- [ ] Variables d'env configurées
- [ ] Volume `/app/data` monté
- [ ] Domaine configuré + HTTPS
- [ ] Premier déploiement réussi
- [ ] Health check OK
- [ ] Frontend charge
- [ ] WebSocket connecté
- [ ] Test API basique
- [ ] Uptime Kuma monitoring
- [ ] Webhook GitHub activé (optionnel)

---

## 🎯 Résumé

| Aspect | État | Détails |
|--------|------|---------|
| **Déploiement** | ✅ Dokploy | Auto via Docker |
| **HTTPS** | ✅ Auto | Let's Encrypt + Traefik |
| **Database** | ✅ SQLite (test) | Volume persistent |
| **WebSocket** | ✅ Actif | Via Traefik upgrade |
| **Rate Limit** | ✅ 100/15min | Par IP |
| **Monitoring** | ✅ Uptime Kuma | Health check 60s |
| **Backups** | 🟡 Manuel | À configurer |
| **Email** | 🟡 Dev mode | À configurer SMTP |
| **Cloudinary** | 🟡 Optionnel | À configurer |

---

**Besoin d'aide?** → Check les logs Dokploy ou SSH sur le VPS
