# 🚀 Plan de Déploiement VPS - FlowSpaces (Phase de Test Public)

## 📌 Objectif
Déployer FlowSpaces sur VPS avec **sécurité adéquate** + **flexibilité pour tests** + **performance optimale**

---

## 🎯 Configuration Recommandée

### VPS Specs Minimales
- **OS**: Ubuntu 22.04 LTS
- **RAM**: 2 GB (1 GB acceptable)
- **CPU**: 1-2 vCores
- **Stockage**: 20 GB (SSD recommandé)
- **Bande passante**: Illimitée ou 1 TB+ mensuel

### Services
- **Docker + Docker Compose** (pour déploiement)
- **Nginx** (reverse proxy + SSL)
- **PostgreSQL** ou **SQLite** (persister en volume)
- **UFW** (firewall basique)

---

## 🔐 Sécurité pour Phase de Test Public

### ✅ À Faire

#### 1. **Authentification & Authorization**
```bash
# ✅ Actif dans le code
- Login/Password avec hachage bcryptjs
- Session tokens dans DB avec expiry
- 2FA TOTP optionnel (présenté à l'utilisateur)
- Rate limiting: 100 req/15min par IP
```

#### 2. **Chiffrement & HTTPS**
```bash
# ✅ Configuration sur Nginx
- SSL/TLS avec Let's Encrypt (certbot)
- Force HTTPS (redirection HTTP → HTTPS)
- HSTS header (strict-transport-security)
- Secure cookies (HttpOnly, Secure, SameSite)
```

#### 3. **Headers de Sécurité**
```bash
# ✅ Via Helmet.js (voir server/src/middleware/security.js)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- CSP (Content Security Policy)
- CORS restreint au domaine
```

#### 4. **Base de Données**
```bash
# ✅ Pour SQLite (test phase)
- Fichier stocké en volume Docker (/app/data/)
- Backups journaliers recommandés
- Seed data limitée (demo users avec mots de passe faibles → à changer)

# 🔄 Pour PostgreSQL (production future)
- Authentification par mot de passe fort
- Connexion via Unix socket ou localhost
- Backups réguliers (pg_dump)
```

#### 5. **Cloudinary & Uploads**
```bash
# ⚠️ Optionnel pour tests
- Stockage fichiers sécurisé
- Validation MIME types
- Limite 10MB par fichier
- CDN avec cache + compression
```

#### 6. **Monitoring & Logs**
```bash
# ✅ Basique
- Health check endpoint (/health)
- Docker logs accessible
- Nginx access/error logs
```

### 🔶 À Adapter pour Tests Publics

| Aspect | Phase Test | Production |
|--------|-----------|-----------|
| **Inscription** | Ouverte (test) | Par invitation |
| **Rate Limit** | 100 req/15min | 100-1000 req/15min |
| **Email** | dev (aucun envoi) | SMTP/Postmark/SendGrid |
| **Cloudinary** | Optionnel | Obligatoire |
| **Backups DB** | Quotidiens | Hourly + replication |
| **Audit Logs** | Activés | Activés + archivés |
| **2FA** | Optionnel | Recommandé |
| **API Keys** | En clair (TODO) | Chiffrés en DB |

---

## 📁 Structure VPS Recommandée

```
/opt/flowspaces/
├── docker-compose.yml          # Orchestration
├── .env                        # Variables d'env (ne pas commiter)
├── .env.example                # Template d'env
├── Dockerfile                  # Build image
├── nginx.conf                  # Config Nginx
├── data/                       # Volume DB (SQLite)
│   ├── dev.db
│   └── dev.db.bak             # Backup quotidien
├── logs/                       # Logs applicatifs
│   ├── nginx/
│   ├── docker/
│   └── app/
└── scripts/
    ├── backup.sh              # Backup quotidien
    ├── restore.sh             # Restauration
    └── health-check.sh        # Monitoring
```

---

## 🛠️ Étapes de Déploiement

### Phase 1: Préparation VPS (30 min)

```bash
# 1. Mise à jour système
sudo apt update && sudo apt upgrade -y

# 2. Installation Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# 3. Installation Nginx + Certbot
sudo apt install -y nginx certbot python3-certbot-nginx

# 4. Installation utilitaires
sudo apt install -y htop wget curl jq git
```

### Phase 2: Configuration Locale (20 min)

```bash
# 1. Préparer les fichiers VPS
mkdir -p /opt/flowspaces/{data,logs,scripts}
cd /opt/flowspaces

# 2. Copier depuis local (sur VPS)
# Option A: Git
git clone https://github.com/TON_USER/kanban.git .
# Option B: SCP
scp -r flowspaces/* user@VPS_IP:/opt/flowspaces/

# 3. Créer le .env
cat > .env << 'EOF'
# === Application ===
NODE_ENV=production
PORT=3001
CLIENT_URL=https://TOM_DOMAINE.COM

# === Database ===
DATABASE_URL=file:/app/data/dev.db

# === Security ===
CORS_ORIGINS=https://TOM_DOMAINE.COM,https://www.TOM_DOMAINE.COM

# === Cloudinary (optionnel) ===
# CLOUDINARY_CLOUD_NAME=xxx
# CLOUDINARY_API_KEY=xxx
# CLOUDINARY_API_SECRET=xxx

# === Email (dev pour tests) ===
EMAIL_PROVIDER=dev
EMAIL_FROM=noreply@TOM_DOMAINE.COM

# === Rate Limiting (production) ===
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
EOF

# 4. Vérifier permissions
sudo chown -R $USER:$USER /opt/flowspaces
chmod 600 .env
```

### Phase 3: Build & Déploiement Docker (15 min)

```bash
# 1. Build l'image
docker build -t flowspaces:latest .

# 2. Lancer le container
docker compose up -d

# 3. Vérifier les logs
docker logs -f todo-app

# 4. Test health
sleep 5 && curl http://localhost:3001/health
```

### Phase 4: Configuration Nginx & SSL (15 min)

```bash
# 1. Copier config Nginx
sudo tee /etc/nginx/sites-available/flowspaces > /dev/null << 'EOF'
# Config dans section "Nginx Configuration" ci-dessous
EOF

# 2. Activer le site
sudo ln -s /etc/nginx/sites-available/flowspaces /etc/nginx/sites-enabled/
sudo nginx -t

# 3. Obtenir certificat SSL
sudo certbot --nginx -d TOM_DOMAINE.COM -d www.TOM_DOMAINE.COM \
  --email TON_EMAIL@example.com --agree-tos

# 4. Recharger Nginx
sudo systemctl reload nginx
```

### Phase 5: Firewall & Monitoring (5 min)

```bash
# 1. Configurer UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw enable

# 2. Vérifier
sudo ufw status

# 3. Monitor les ressources
docker stats flowspaces
htop
```

---

## 📝 Nginx Configuration (Avancée)

**Fichier**: `/etc/nginx/sites-available/flowspaces`

```nginx
# Rate limiting zone
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login_limit:10m rate=5r/m;

# Redirect HTTP → HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name TOM_DOMAINE.COM www.TOM_DOMAINE.COM;
    return 301 https://$server_name$request_uri;
}

# HTTPS server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name TOM_DOMAINE.COM www.TOM_DOMAINE.COM;

    # SSL certificates (Certbot)
    ssl_certificate /etc/letsencrypt/live/TOM_DOMAINE.COM/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/TOM_DOMAINE.COM/privkey.pem;

    # SSL protocols & ciphers
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # SSL session caching
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # HSTS (strict security)
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Upload size
    client_max_body_size 10M;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    gzip_min_length 256;

    # Proxy general
    location / {
        limit_req zone=api_limit burst=20 nodelay;
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Socket.IO optimisé
    location /socket.io/ {
        proxy_pass http://127.0.0.1:3001/socket.io/;
        proxy_http_version 1.1;
        proxy_buffering off;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Login endpoint - rate limit strict
    location /api/auth/login {
        limit_req zone=login_limit burst=3 nodelay;
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    # Health check (monitoring)
    location /health {
        access_log off;
        proxy_pass http://127.0.0.1:3001/health;
    }

    # Static assets (cache)
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        proxy_pass http://127.0.0.1:3001;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 🔄 Maintenance & Monitoring

### Backup Automatique

**Fichier**: `/opt/flowspaces/scripts/backup.sh`

```bash
#!/bin/bash
BACKUP_DIR="/opt/flowspaces/data"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="dev.db.backup_$DATE.tar.gz"

# Arrêter le container gracefully
docker stop todo-app

# Créer backup
tar -czf "$BACKUP_DIR/$BACKUP_FILE" "$BACKUP_DIR/dev.db"

# Relancer
docker start todo-app

# Garder les 7 derniers backups
find "$BACKUP_DIR" -name "dev.db.backup_*.tar.gz" -mtime +7 -delete

echo "✅ Backup créé: $BACKUP_FILE"
```

**Setup cron** (quotidien à 2h du matin):
```bash
crontab -e
# Ajouter:
0 2 * * * /opt/flowspaces/scripts/backup.sh >> /opt/flowspaces/logs/backup.log 2>&1
```

### Monitoring Health

```bash
# Setup cron (toutes les 5 min)
*/5 * * * * curl -s http://localhost:3001/health || \
  (docker restart todo-app && \
   echo "⚠️ App relancée - $(date)" >> /opt/flowspaces/logs/restart.log)
```

### Logs & Troubleshooting

```bash
# Logs applicatifs
docker logs todo-app | tail -100

# Logs Nginx
tail -f /var/log/nginx/error.log
tail -f /var/log/nginx/access.log

# Ressources
docker stats todo-app

# Vérifier port 3001
lsof -i :3001
```

---

## 🧪 Tests Avant Production

### 1️⃣ Tests de Sécurité

```bash
# Test SSL/TLS
curl -I https://TOM_DOMAINE.COM
# Doit avoir: Strict-Transport-Security, X-Frame-Options, etc.

# Test CORS
curl -H "Origin: https://autre.com" https://TOM_DOMAINE.COM/api/users

# Test rate limiting
for i in {1..150}; do curl https://TOM_DOMAINE.COM/api/auth/login; done
# Après ~100 requêtes: doit recevoir 429 Too Many Requests
```

### 2️⃣ Tests de Performance

```bash
# Load test (Apache Bench)
ab -n 1000 -c 10 https://TOM_DOMAINE.COM/

# WebSocket test
wscat -c wss://TOM_DOMAINE.COM/socket.io/?transport=websocket
```

### 3️⃣ Tests Fonctionnels

```bash
# 1. Créer un utilisateur de test
curl -X POST https://TOM_DOMAINE.COM/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"testuser","password":"password123","email":"test@example.com"}'

# 2. Se connecter
curl -X POST https://TOM_DOMAINE.COM/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"name":"testuser","password":"password123"}'

# 3. Créer une task
curl -X POST https://TOM_DOMAINE.COM/api/tasks \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Task","description":"Test"}'

# 4. Tester WebSocket (ouvrir DevTools, onglet Network/WS)
```

---

## 🔄 Mise à Jour de l'App

```bash
cd /opt/flowspaces

# 1. Arrêter
docker compose down

# 2. Récupérer les changements
git pull origin main
# OU upload les nouveaux fichiers

# 3. Rebuild
docker build -t flowspaces:latest .

# 4. Relancer
docker compose up -d

# 5. Vérifier
docker logs -f todo-app
curl https://TOM_DOMAINE.COM/health
```

---

## ⚠️ Points d'Attention - Phase Test Public

### 🔴 À Faire Immédiatement
- [ ] Changer les credentials par défaut (seed data)
- [ ] Activer HTTPS + certificat SSL
- [ ] Configurer firewall UFW
- [ ] Tester rate limiting
- [ ] Vérifier les logs pour erreurs
- [ ] Backup quotidien DB

### 🟡 À Faire Avant Production Finale
- [ ] Migrer SQLite → PostgreSQL
- [ ] Configurer SMTP pour emails
- [ ] Intégrer Cloudinary
- [ ] Activer 2FA par défaut
- [ ] Audit logs archivés
- [ ] API keys chiffrées en DB (encrypt_at_rest)
- [ ] Monitoring externe (Uptime Robot, etc.)
- [ ] Disaster recovery plan

### 🟢 Optionnel (Nice to Have)
- [ ] CDN Cloudflare
- [ ] Database replication/failover
- [ ] Load balancing
- [ ] Kubernetes (plus tard)

---

## 📊 Checklist Déploiement

```
PREPARATION
[ ] VPS 2GB RAM, Ubuntu 22.04
[ ] Docker + Docker Compose installés
[ ] Domaine pointant vers VPS IP
[ ] DNS propagé (dig TOM_DOMAINE.COM)

BUILD & CONFIG
[ ] .env configuré (CLIENT_URL, DATABASE_URL)
[ ] Dockerfile buildable (docker build -t flowspaces:latest .)
[ ] docker-compose.yml validé
[ ] Volumes /data créés

DEPLOYMENT
[ ] docker compose up -d lancé
[ ] Container running (docker ps)
[ ] Health check OK (curl localhost:3001/health)
[ ] Nginx config validée (sudo nginx -t)
[ ] Certbot SSL installé
[ ] Firewall UFW activé

SECURITY
[ ] HTTPS fonctionnel
[ ] Rate limiting testé
[ ] Headers sécurité présents
[ ] Logs applicatifs visibles
[ ] Backup setup en cron

TESTING
[ ] Interface accessible https://TOM_DOMAINE.COM
[ ] Login/Signup fonctionne
[ ] WebSocket OK (ouvrir DevTools WS)
[ ] API endpoints répondent
[ ] Création task fonctionne
```

---

## 📞 Support & Aide

| Problème | Solution |
|----------|----------|
| 502 Bad Gateway | `docker ps` + `curl localhost:3001/health` |
| WebSocket ❌ | Vérifier Nginx `Upgrade` header + `proxy_http_version 1.1` |
| Certificat SSL échoue | Vérifier DNS propagation + ports 80/443 ouverts |
| App lente | `docker stats` + vérifier RAM/CPU disponible |
| DB vide | `docker exec todo-app sh -c "cd server && npm run db:seed"` |

---

**Besoin d'aide?** Check les logs: `docker logs todo-app` + `tail -f /var/log/nginx/error.log`
