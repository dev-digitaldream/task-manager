# 🚀 FlowSpaces VPS Deployment - Complete Guide

## 📋 Quick Summary

Tu as une **ancienne version online** sur ton VPS à `85.121.48.53`

**Objectif**: Mettre à jour vers la **dernière version** + ajouter une stack complète de **monitoring & alertes**

---

## ✅ Fichiers Créés

| File | Purpose | Action |
|------|---------|--------|
| **EXECUTE_NOW.md** ⭐ | START HERE | Lire d'abord |
| **VPS_UPDATE_SCRIPT.sh** ⭐ | Main automation | Exécute le script |
| **UPDATE_SUMMARY.md** | Overview complet | Lire après script |
| **VPS_UPDATE_GUIDE.md** | Configuration détaillée | Lire pour détails |
| **VPS_BEST_PRACTICES.md** | Security & optimization | Lire pour sécurité |
| **vps-update-via-dokploy.md** | Dokploy deployment | Référence Dokploy |

---

## 🎯 EXÉCUTION (3 COMMANDES)

### 1️⃣ Lancer le script
```bash
ssh root@85.121.48.53 'bash -s' < VPS_UPDATE_SCRIPT.sh
```

### 2️⃣ Attendre (15-20 min)

### 3️⃣ Vérifier
```bash
curl https://www.flowspaces.work/health
docker ps  # 5 containers running
```

---

## 📊 What Gets Installed

✅ **FlowSpaces** (Latest version)
✅ **Uptime Kuma** (Health monitoring) → http://85.121.48.53:3002
✅ **Portainer** (Container management) → https://85.121.48.53:9000
✅ **Prometheus** (Metrics collection) → http://85.121.48.53:9090
✅ **Grafana** (Dashboards) → http://85.121.48.53:3003
✅ **Automated backups** (Daily @ 2 AM)
✅ **Health checks** (Every 5 min)
✅ **Auto-restart** (If app crashes)

---

## 🔐 Security Post-Update

⚠️ **IMMEDIATE ACTIONS**

1. Change Grafana password
   - Login: admin / admin → Change password

2. Setup Uptime Kuma auth
   - http://85.121.48.53:3002 → Create account

3. Setup Portainer auth
   - https://85.121.48.53:9000 → Create account

---

## 📝 Files Explained

### VPS_UPDATE_SCRIPT.sh
**What**: Main automation script
**Does**: 
- Updates FlowSpaces
- Rebuilds Docker image
- Installs all monitoring tools
- Configures backups & alerts
**Run**: `ssh root@85.121.48.53 'bash -s' < VPS_UPDATE_SCRIPT.sh`

### EXECUTE_NOW.md
**What**: Quick start guide
**Contains**: 3 commands to execute
**Read**: First

### UPDATE_SUMMARY.md
**What**: Complete overview
**Contains**: Architecture, checklist, next steps
**Read**: After script runs

### VPS_UPDATE_GUIDE.md
**What**: Detailed configuration guide
**Contains**: Setup instructions, troubleshooting, commands
**Read**: For configuration details

### VPS_BEST_PRACTICES.md
**What**: Security & optimization guide
**Contains**: Security hardening, performance tuning, monitoring setup
**Read**: For production preparation

---

## 🎯 Architecture

```
Internet Users
    ↓
HTTPS (Dokploy Traefik)
    ↓
┌────────────────────────────────┐
│ VPS 85.121.48.53               │
├────────────────────────────────┤
│                                │
│ FlowSpaces (Port 3001)         │
│ Latest version                 │
│                                │
│ Monitoring Stack:              │
│ • Uptime Kuma (3002)          │
│ • Portainer (9000)            │
│ • Prometheus (9090)           │
│ • Grafana (3003)              │
│                                │
│ Data:                          │
│ • SQLite DB (persistent)       │
│ • Daily backups                │
│                                │
│ Automation:                    │
│ • Health checks every 5 min   │
│ • Auto-restart on failure     │
│ • Backups at 2 AM daily       │
│                                │
└────────────────────────────────┘
```

---

## ✅ Verification Checklist

After script completes:

- [ ] Docker ps shows 5 containers
- [ ] FlowSpaces health: curl https://www.flowspaces.work/health
- [ ] Uptime Kuma: http://85.121.48.53:3002
- [ ] Portainer: https://85.121.48.53:9000
- [ ] Prometheus: http://85.121.48.53:9090
- [ ] Grafana: http://85.121.48.53:3003
- [ ] Changed Grafana password
- [ ] Added monitor in Kuma
- [ ] Tested failover (stopped container, verified restart)

---

## 📞 Troubleshooting

### Script fails
```bash
# Check logs
ssh root@85.121.48.53 'docker logs flowspaces'

# Run manually
ssh root@85.121.48.53 'cd /opt/flowspaces && docker build . && docker compose up -d'
```

### Health check fails
```bash
# Test direct
ssh root@85.121.48.53 'curl http://localhost:3001/health'

# See logs
ssh root@85.121.48.53 'docker logs -f flowspaces'
```

### Services not running
```bash
# Check all
ssh root@85.121.48.53 'docker ps'

# Restart all
ssh root@85.121.48.53 'docker compose restart'
```

---

## 🎯 Next Steps

### Immediate (After script)
1. Verify all services running
2. Change passwords
3. Configure alerts

### Short term (Week 1-2)
1. Monitor dashboards
2. Test failover procedures
3. Verify backups working

### Medium term (Before production)
1. Consider PostgreSQL migration
2. Setup SMTP email
3. Integrate Cloudinary
4. Load test

---

## 📊 Monitoring Stack Details

### Uptime Kuma
- Health checks for endpoints
- Status page for users
- Notifications (email, Slack, webhook)
- SSL certificate expiry alerts

### Portainer
- Docker container management
- Real-time logs
- Container restart/stop
- Resource monitoring

### Prometheus
- Metrics collection from Docker
- Time-series database
- Custom queries (PromQL)
- Alerting rules

### Grafana
- Dashboards from Prometheus
- Custom visualizations
- Alert notifications
- User management

---

## 🔄 Automation Included

✅ **Daily Backups**
- Time: 2 AM UTC
- Location: /opt/flowspaces/backups/
- Retention: 30 days

✅ **Health Checks**
- Frequency: Every 5 minutes
- Auto-restart if down
- Logs: /opt/flowspaces/logs/alerts.log

✅ **Container Restart**
- On failure: Auto-restart
- Max retries: 3x before alert
- Downtime: < 1 minute

---

## 💡 Tips

1. **Logs are your friend**
   ```bash
   docker logs -f flowspaces
   tail -f /opt/flowspaces/logs/
   ```

2. **Test failover**
   ```bash
   docker stop flowspaces
   # Should restart within 1 min
   # Check Kuma for alert
   ```

3. **Monitor the monitors**
   - Don't let monitoring fail
   - Test alerts regularly
   - Keep logs for debugging

---

## 🎉 Success!

When you see:
```
✅ UPDATE COMPLETE!

📊 MONITORING SERVICES:
  🟢 Uptime Kuma:   http://85.121.48.53:3002
  🟢 Portainer:     https://85.121.48.53:9000
  🟢 Prometheus:    http://85.121.48.53:9090
  🟢 Grafana:       http://85.121.48.53:3003
```

**Your VPS is ready! 🚀**

---

## 📚 Documentation Structure

```
EXECUTE_NOW.md ← Start here!
    ↓
VPS_UPDATE_SCRIPT.sh ← Run this
    ↓
UPDATE_SUMMARY.md ← Read this
    ↓
VPS_UPDATE_GUIDE.md ← For configuration
    ↓
VPS_BEST_PRACTICES.md ← For security
    ↓
vps-update-via-dokploy.md ← If using Dokploy
```

---

**Ready? Run the script: `ssh root@85.121.48.53 'bash -s' < VPS_UPDATE_SCRIPT.sh`**

**Questions? Check UPDATE_SUMMARY.md or VPS_UPDATE_GUIDE.md**
