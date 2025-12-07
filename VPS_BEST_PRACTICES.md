# 🛡️ VPS + Dokploy - Best Practices (Phase Test Public)

## 📋 Table des matières
1. [Sécurité](#sécurité)
2. [Performance](#performance)
3. [Monitoring](#monitoring)
4. [Maintenance](#maintenance)
5. [Troubleshooting](#troubleshooting)

---

## 🔒 Sécurité

### ✅ Actif dans l'App (Code)

```javascript
// server/src/middleware/security.js

✅ Helmet.js              // Headers sécurité
✅ CORS configuré         // Restreint au domaine
✅ Rate limiting          // 100 req/15min par IP
✅ Input sanitization     // Strips HTML/scripts
✅ Password hashing       // bcryptjs
✅ Session tokens         // Expiry + DB tracking
✅ 2FA TOTP optionnel     // otplib + backup codes
```

### ✅ Actif sur Dokploy

```yaml
✅ HTTPS/SSL              # Let's Encrypt automatique
✅ TLS 1.2+              # Traefik secure defaults
✅ WebSocket upgrade     # Propriétaire du upgrade header
✅ X-Frame-Options       # DENY (iframe protection)
✅ HSTS header           # Force HTTPS
```

### 🟡 À Vérifier sur le VPS

```bash
# Firewall
sudo ufw status
# Doit montrer: 22/tcp, 80/tcp, 443/tcp ALLOW

# SSH key-based auth uniquement
sudo nano /etc/ssh/sshd_config
# PasswordAuthentication no
# PermitRootLogin no (optionnel)

# Fail2Ban (optionnel)
sudo apt install fail2ban
sudo systemctl enable fail2ban
```

### 🟡 À Faire Avant Production

| Feature | Phase Test | Production |
|---------|-----------|-----------|
| **Signup** | Ouverte | Par invitation |
| **API Keys** | Plaintext DB | Chiffrés (encrypt_at_rest) |
| **Backups** | Quotidiens | Hourly + replication |
| **Audit Logs** | Actifs | Actifs + archivés |
| **Email** | Dev (aucun) | SMTP réel |
| **2FA** | Optionnel | Recommandé |
| **Rate Limit** | 100/15min | Ajuster selon trafic |

---

## ⚡ Performance

### Database

```sql
-- Indices recommandés pour PostgreSQL
CREATE INDEX idx_tasks_workspace ON tasks(workspaceId);
CREATE INDEX idx_tasks_assignee ON tasks(assigneeId);
CREATE INDEX idx_tasks_owner ON tasks(ownerId);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_workspace_slug ON workspaces(slug);
```

### Caching

```javascript
// À ajouter: Redis pour cache
// APP_ENV: development → no cache
// APP_ENV: production → Redis cache

// Exemples
- Tasks list (5 min)
- User list (5 min)
- Workspace members (15 min)
```

### CDN

```bash
# Option: Cloudflare CDN
# - Cache static assets
# - DDoS protection
# - Global edge locations

# Docs: https://dash.cloudflare.com/
```

### WebSocket Optimization

```javascript
// Socket.IO best practices
io.engine.ws.perMessageDeflate = false;  // Disable compression
io.engine.maxHttpBufferSize = 1e6;       // 1MB limit
io.sockets.setMaxListeners(0);           // Max listeners
```

### Load Test

```bash
# Test avec Apache Bench
ab -n 1000 -c 50 https://www.TON_DOMAINE.COM/

# WebSocket load test
# Tool: artillery (npm install -g artillery)
artillery quick --count 100 --num 1000 https://www.TON_DOMAINE.COM/
```

---

## 📊 Monitoring

### Health Endpoints

```bash
# Endpoint built-in
GET /health

# Response
{
  "status": "OK",
  "timestamp": "2025-12-07T...",
  "uptime": 12345,
  "database": "connected"
}
```

### Uptime Kuma Setup

```bash
# 1. Ouvrir http://85.121.48.53:3002
# 2. Add Monitor
#    - Type: HTTPS
#    - URL: https://www.TON_DOMAINE.COM/health
#    - Interval: 60s
#    - Alert: When down
```

### Logs Management

```bash
# Docker logs
docker logs -f container_name --tail 100

# Log rotation
# À configurer: /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

### Metrics (Optionnel)

```bash
# Prometheus + Grafana
docker run -d -p 9090:9090 prom/prometheus

# Docker stats
docker stats container_name

# Resources
htop
free -h
df -h
```

---

## 🔄 Maintenance

### Backups

```bash
# Backup quotidien SQLite
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker cp flowspaces:/app/data/dev.db backup_$DATE.db
tar -czf backup_$DATE.tar.gz backup_$DATE.db
rm backup_$DATE.db

# Cron: 0 2 * * * /path/to/backup.sh

# Retention: Garder 7 derniers
find backups/ -name "backup_*.tar.gz" -mtime +7 -delete
```

### Restore Backup

```bash
# Extraire backup
tar -xzf backup_20250107_020000.tar.gz

# Copy dans container
docker cp backup_20250107_020000.db container:/app/data/dev.db

# Redémarrer
docker restart container
```

### Database Maintenance

```bash
# SQLite
docker exec container sqlite3 /app/data/dev.db "VACUUM;"

# PostgreSQL
docker exec container pg_dump > backup.sql
docker exec container psql -c "REINDEX DATABASE flowspaces;"
```

### Updates

```bash
# Procédure sûre

# 1. Backup DB
docker cp container:/app/data/dev.db backup_pre_update.db

# 2. Update code
git pull origin main

# 3. Rebuild
docker build -t flowspaces:latest .

# 4. Redeploy (rollback plan: restore previous image)
docker compose up -d

# 5. Verify
curl https://www.TON_DOMAINE.COM/health

# 6. Monitor logs
docker logs -f container_name
```

---

## 🚨 Troubleshooting

### App ne démarre pas

```bash
# 1. Check logs
docker logs -f container_id

# 2. Common errors
# - "DATABASE_URL not set" → Add env var
# - "Port already in use" → Change port
# - "npm ERR!" → Check Dockerfile install

# 3. Local test
docker build .
docker run -it -p 3001:3001 image_id
```

### WebSocket échoue

```bash
# 1. Check Traefik routing
docker exec traefik_container curl http://localhost:3001/socket.io/

# 2. Check headers
curl -i -N -H "Upgrade: websocket" https://www.TON_DOMAINE.COM/socket.io/

# 3. Browser DevTools
# Network → WS tab → Check handshake
# Console → Check for errors
```

### HTTPS/SSL Issues

```bash
# 1. Check certificate
openssl s_client -connect www.TON_DOMAINE.COM:443

# 2. Renewal
docker exec traefik_container certbot renew

# 3. Traefik logs
docker logs traefik_container | grep -i ssl
```

### Database Locked

```bash
# SQLite specific
# Problème: Concurrent writes lock DB

# Solution 1: Restart app
docker restart container

# Solution 2: Migrate to PostgreSQL

# Prevent: SQLite suitable for < 100 concurrent users
```

### High Memory Usage

```bash
# Check resources
docker stats

# Common causes:
# - Memory leak (check logs)
# - Too many connections
# - Large file uploads

# Temporary fix
docker restart container

# Permanent: Increase container limits
# Dokploy → App → Resources → Memory limit
```

### Rate Limiting Too Strict

```bash
# Adjust in .env
RATE_LIMIT_MAX_REQUESTS=200    # Increase from 100
RATE_LIMIT_WINDOW_MS=600000    # Decrease window to 10min

# Or disable in development
if (process.env.NODE_ENV === 'production') {
  app.use('/api', apiLimiter);
}
```

---

## 🎯 Pre-Production Checklist

### Sécurité
- [ ] Certificat SSL/TLS valide (HTTPS)
- [ ] CORS configuré correctement
- [ ] Rate limiting en place
- [ ] Input validation sur tous endpoints
- [ ] Secrets dans env vars (pas hardcoded)
- [ ] Firewall UFW configuré
- [ ] SSH key-based auth uniquement
- [ ] Audit logs activés

### Performance
- [ ] Indicespour base de données
- [ ] Logs de debug désactivés (production)
- [ ] Cache Redis optionnel
- [ ] CDN pour assets statiques
- [ ] Gzip compression activée
- [ ] Load test OK (100+ concurrent)

### Monitoring
- [ ] Health endpoint accessible
- [ ] Uptime Kuma configuré
- [ ] Log rotation en place
- [ ] Alertes incidents configurées
- [ ] Backup quotidien testé

### Données
- [ ] Backup strategy défini
- [ ] Disaster recovery plan
- [ ] Database migration tested (si SQLite→PostgreSQL)
- [ ] Sensitive data encrypted (API keys, etc.)

### Documentation
- [ ] Runbook de deployment
- [ ] Runbook de rollback
- [ ] Troubleshooting guide
- [ ] Contact d'urgence documenté

---

## 📞 Emergency Contacts & Resources

```
Dokploy Docs:        https://dokploy.com/docs
Docker Docs:         https://docs.docker.com
Let's Encrypt:       https://letsencrypt.org
Socket.IO:           https://socket.io/docs
Traefik:             https://doc.traefik.io

Support:
- Dokploy Community:  https://github.com/dokploy/dokploy
- Docker Issues:      https://github.com/moby/moby/issues
```

---

## 💡 Tips & Tricks

### Redeploy Rapide

```bash
# Change code → Push → Auto redeploy (webhook)
git push origin main
# Dokploy redéploie automatiquement
```

### Test Avant Production

```bash
# Local testing
npm run setup
npm run dev

# Docker testing
docker build .
docker run -p 3001:3001 image

# SSL testing
curl -k https://localhost:3001  # -k ignore self-signed
```

### Debug Mode

```bash
# Augmenter verbosité logs
LOG_LEVEL=debug

# Socket.IO debug
io.set('log level', 3);  // 0=error, 1=warn, 2=info, 3=debug
```

### Resources

```bash
# Limiter per container
# Dokploy → App → Resources
# CPU: 1 vCore (1000m)
# Memory: 512MB

# Test limits
docker run -m 512m --cpus 1 image
```

---

**🎯 Summary**: Sécurité + Performance = Confiance utilisateurs en phase de test!
