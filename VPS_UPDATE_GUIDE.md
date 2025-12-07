# 🚀 VPS Update Guide - FlowSpaces + Full Monitoring Stack

## 🎯 Objectif

Mettre à jour FlowSpaces avec la dernière version + installer une stack complète de monitoring:
- ✅ **Uptime Kuma** - Monitoring health checks
- ✅ **Portainer** - Gestion containers Docker
- ✅ **Prometheus** - Collecte métriques
- ✅ **Grafana** - Dashboards & alertes
- ✅ **Backups automatiques** - Quotidiens
- ✅ **Auto-restart** - Redémarrage automatique si crash

---

## 📋 Prérequis

- SSH access au VPS: `root@85.121.48.53`
- Password: `EK&a0V@txAiQeVB!SMW4`
- Docker + Docker Compose installés
- Git repository accessible

---

## 🚀 EXÉCUTION DU SCRIPT

### Option 1: Exécution Directe (Recommandé)

```bash
# Depuis ta machine local
ssh root@85.121.48.53 'bash -s' < /chemin/vers/VPS_UPDATE_SCRIPT.sh

# Ou depuis le repo
ssh root@85.121.48.53 'bash -s' < VPS_UPDATE_SCRIPT.sh
```

### Option 2: Upload et Exécution

```bash
# Upload le script
scp VPS_UPDATE_SCRIPT.sh root@85.121.48.53:/root/

# Se connecter et exécuter
ssh root@85.121.48.53
bash /root/VPS_UPDATE_SCRIPT.sh
```

### Option 3: Via Dokploy (Si disponible)

```bash
# Dans Dokploy Dashboard
Application → Execute Command → Paste script content
```

---

## ⏱️ Temps d'Exécution

| Étape | Durée | Notes |
|-------|-------|-------|
| Stop ancien | 1 min | |
| Pull code | 2 min | Optionnel si Dokploy |
| Build Docker | 5-10 min | ⏳ Longest step |
| Start services | 2 min | |
| Install monitoring | 3 min | |
| Config backups | 1 min | |
| **TOTAL** | **15-20 min** | |

---

## 📊 Services Installés

### 1. Uptime Kuma (Monitoring Principal)

```
Port: 3002
URL: http://85.121.48.53:3002

Fonctionnalités:
✅ Health checks HTTP/HTTPS
✅ Status page public
✅ Notifications (email, webhook, Slack, etc.)
✅ Uptime tracking
✅ Response time monitoring
✅ SSL certificate alerts
```

**Setup Initial**:
1. Ouvrir http://85.121.48.53:3002
2. Créer admin account
3. Add Monitor:
   - Type: HTTPS
   - URL: `https://www.TON_DOMAINE.COM/health`
   - Interval: 60s
   - Notifications: Email/Webhook

### 2. Portainer (Container Management)

```
Port: 9000 (Web), 8000 (API)
URL: https://85.121.48.53:9000

Fonctionnalités:
✅ Gestion containers Docker
✅ Logs real-time
✅ CPU/Memory monitoring
✅ Container restart
✅ Image management
```

**Setup Initial**:
1. Ouvrir https://85.121.48.53:9000
2. Créer admin account
3. Accès à tous les containers

### 3. Prometheus (Métriques)

```
Port: 9090
URL: http://85.121.48.53:9090

Fonctionnalités:
✅ Collecte métriques Docker
✅ Query language (PromQL)
✅ Time-series database
✅ Scraping configs
```

**Queries Utiles**:
```promql
# CPU usage
container_cpu_usage_seconds_total{name="flowspaces"}

# Memory usage
container_memory_usage_bytes{name="flowspaces"}

# Network IO
container_network_receive_bytes_total
```

### 4. Grafana (Dashboards & Alertes)

```
Port: 3003
URL: http://85.121.48.53:3003
Login: admin / admin (⚠️ Change password!)

Fonctionnalités:
✅ Dashboards personnalisés
✅ Alertes automatiques
✅ Intégration avec Prometheus
✅ Notifications
```

**Setup Initial**:
1. Ouvrir http://85.121.48.53:3003
2. Login: admin / admin
3. **CHANGER LE PASSWORD IMMÉDIATEMENT**
4. Add Data Source: Prometheus (http://prometheus:9090)
5. Import dashboards

---

## 🔧 Configuration Post-Update

### 1. Uptime Kuma - Ajouter Monitors

```bash
# Via API
curl -X POST http://85.121.48.53:3002/api/monitor \
  -H "Content-Type: application/json" \
  -d '{
    "name": "FlowSpaces Health",
    "type": "http",
    "url": "https://www.flowspaces.work/health",
    "interval": 60,
    "method": "GET"
  }'
```

### 2. Grafana - Créer Dashboard

1. Ouvrir Grafana
2. **+** → **Dashboard**
3. Add Panel → Prometheus
4. Queries:
   ```
   up{job="flowspaces"}
   container_memory_usage_bytes{name="flowspaces"} / 1024 / 1024 MB
   ```

### 3. Configurer Alertes

```bash
# Dans Grafana
Alerts → Notification Channels → Add
- Type: Slack / Email / Webhook
- Configure avec tes préférences
```

---

## 📋 Vérification Post-Update

### ✅ Checklist

```bash
# 1. FlowSpaces running
docker ps | grep flowspaces
curl http://localhost:3001/health

# 2. Uptime Kuma
docker ps | grep uptime-kuma
curl http://localhost:3002

# 3. Portainer
docker ps | grep portainer
curl -k https://localhost:9000

# 4. Prometheus
docker ps | grep prometheus
curl http://localhost:9090

# 5. Grafana
docker ps | grep grafana
curl http://localhost:3003

# 6. Logs
docker logs -f flowspaces
tail -f /opt/flowspaces/logs/backup.log
tail -f /opt/flowspaces/logs/alerts.log
```

---

## 🛠️ Commandes Utiles

### Viewing Logs

```bash
# FlowSpaces logs
docker logs -f flowspaces --tail 100

# All containers
docker ps -a

# Last 1000 lines
docker logs flowspaces | tail -1000

# Real-time logs with timestamps
docker logs -f flowspaces --timestamps
```

### Database Backup

```bash
# Manual backup
docker exec flowspaces tar -czf /app/data/backup_$(date +%s).tar.gz /app/data/dev.db

# List backups
ls -lah /opt/flowspaces/backups/

# Restore backup
tar -xzf /opt/flowspaces/backups/dev.db.backup_20250107_020000.tar.gz
docker cp dev.db flowspaces:/app/data/dev.db
```

### Container Management

```bash
# Restart FlowSpaces
docker restart flowspaces

# Stop all
docker compose down

# Start all
docker compose up -d

# View resource usage
docker stats flowspaces

# Enter container
docker exec -it flowspaces sh
```

---

## 🚨 Troubleshooting

### ❌ Script fails during Docker build

```bash
# Check error
docker build .

# Clean and retry
docker system prune -a
docker build -t flowspaces:latest --no-cache .
```

### ❌ Kuma can't reach health endpoint

```bash
# Test manually
curl -i https://www.flowspaces.work/health

# Check DNS
dig flowspaces.work

# Check firewall
sudo ufw status

# Check Nginx
docker logs nginx
```

### ❌ Prometheus not scraping metrics

```bash
# Check prometheus config
cat /opt/prometheus/prometheus.yml

# Restart Prometheus
docker restart prometheus

# Check targets
# Visit http://85.121.48.53:9090/targets
```

### ❌ Grafana can't connect to Prometheus

```bash
# Check network
docker network ls

# Add data source with: http://prometheus:9090
# NOT: http://localhost:9090

# Test connection
docker exec grafana curl http://prometheus:9090
```

---

## 📊 Monitoring Stack URLs

| Service | URL | Port | Purpose |
|---------|-----|------|---------|
| **FlowSpaces** | https://www.flowspaces.work | 443 | Main app |
| **Uptime Kuma** | http://85.121.48.53:3002 | 3002 | Health monitoring |
| **Portainer** | https://85.121.48.53:9000 | 9000 | Container management |
| **Prometheus** | http://85.121.48.53:9090 | 9090 | Metrics DB |
| **Grafana** | http://85.121.48.53:3003 | 3003 | Dashboards |

---

## 🔐 Security Notes

### ⚠️ Important

- [ ] **CHANGE Grafana password**: admin → your_strong_password
- [ ] **Setup Uptime Kuma auth**: Add password
- [ ] **Portainer security**: Change admin password
- [ ] **Restrict ports**: UFW firewall rules
  ```bash
  sudo ufw allow 22/tcp
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  sudo ufw allow 3002/tcp    # Kuma
  sudo ufw allow 9000/tcp    # Portainer
  # sudo ufw allow 9090/tcp  # Prometheus (internal only)
  # sudo ufw allow 3003/tcp  # Grafana (internal only)
  sudo ufw enable
  ```

---

## 🔄 Maintenance Tasks

### Daily
- ✅ Automatic: Backup DB at 2 AM
- ✅ Automatic: Health check every 5 min
- ✅ Automatic: Auto-restart on failure

### Weekly
- [ ] Check Kuma status page
- [ ] Review Grafana dashboards
- [ ] Check logs for errors

### Monthly
- [ ] Update Docker images
- [ ] Review monitoring alerts
- [ ] Test backup restore procedure
- [ ] Update SSL certificates (Let's Encrypt auto)

---

## 📝 Exemple Configuration Uptime Kuma

### Monitor 1: Health Check
```
Name: FlowSpaces Health
Type: HTTPS
URL: https://www.flowspaces.work/health
Interval: 60
Retry: 5
```

### Monitor 2: API Endpoint
```
Name: FlowSpaces API
Type: HTTPS
URL: https://www.flowspaces.work/api/users
Interval: 120
Expected Status: 200
```

### Monitor 3: SSL Certificate
```
Name: SSL Certificate
Type: HTTPS
URL: https://www.flowspaces.work
Interval: 86400 (Daily)
Alert: 30 days before expiry
```

---

## 💾 Backup Strategy

### Location
```
/opt/flowspaces/backups/
```

### Schedule
- Frequency: Daily at 2 AM
- Retention: 30 days
- Format: dev.db.backup_YYYYMMDD_HHMMSS.tar.gz

### Manual Backup
```bash
/opt/flowspaces/backup.sh
```

### Restore Procedure
```bash
# 1. Stop app
docker stop flowspaces

# 2. Restore backup
cd /opt/flowspaces/backups
tar -xzf dev.db.backup_20250107_020000.tar.gz
docker cp dev.db flowspaces:/app/data/dev.db

# 3. Restart
docker start flowspaces

# 4. Verify
docker logs -f flowspaces
```

---

## ✅ Post-Update Validation

### 1. Connectivity
```bash
curl https://www.flowspaces.work/health
# Should return: {"status":"OK",...}
```

### 2. WebSocket
```bash
# Open DevTools → Network → WS
# Should see socket.io connection
```

### 3. Monitoring Stack
```bash
# All should return 200
curl http://85.121.48.53:3002    # Kuma
curl -k https://85.121.48.53:9000 # Portainer
curl http://85.121.48.53:9090     # Prometheus
curl http://85.121.48.53:3003     # Grafana
```

---

**✅ Update complet! Ton app est à jour avec monitoring complet en place.**

**👉 Prochaine étape**: Configurer les alertes dans Uptime Kuma
