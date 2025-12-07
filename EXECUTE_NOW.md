# 🚀 EXÉCUTE MAINTENANT - VPS Update

## ⚡ 3 COMMANDES SEULEMENT

### 1️⃣ LANCER LE SCRIPT (À FAIRE IMMÉDIATEMENT)

**Sur ta machine local:**

```bash
cd /Volumes/ExtremeSSD/projetcs/kanban

ssh root@85.121.48.53 'bash -s' < VPS_UPDATE_SCRIPT.sh
```

**Ou si écho du password:**

```bash
scp VPS_UPDATE_SCRIPT.sh root@85.121.48.53:/tmp/
ssh root@85.121.48.53 'bash /tmp/VPS_UPDATE_SCRIPT.sh'
```

---

### 2️⃣ ATTENDRE (15-20 minutes)

Le script va:
```
✅ Arrêter la version ancienne
✅ Builder nouvelle image Docker (5-10 min ⏳)
✅ Démarrer les services
✅ Installer Uptime Kuma, Portainer, Prometheus, Grafana
✅ Configurer backups quotidiens
✅ Configurer alertes
```

**À la fin tu verras:**
```
✅ UPDATE COMPLETE!

📊 MONITORING SERVICES:
  🟢 Uptime Kuma:   http://85.121.48.53:3002
  🟢 Portainer:     https://85.121.48.53:9000
  🟢 Prometheus:    http://85.121.48.53:9090
  🟢 Grafana:       http://85.121.48.53:3003
```

---

### 3️⃣ VÉRIFIER (5 minutes)

**Test 1: App fonctionne**
```bash
curl https://www.flowspaces.work/health
```
Doit retourner: `{"status":"OK",...}`

**Test 2: Services running**
```bash
ssh root@85.121.48.53 'docker ps'
```
Doit montrer 5 containers:
- flowspaces
- uptime-kuma
- portainer
- prometheus
- grafana

**Test 3: Ouvrir dashboards**
```
- http://85.121.48.53:3002 (Uptime Kuma)
- https://85.121.48.53:9000 (Portainer)
- http://85.121.48.53:3003 (Grafana)
```

---

## 🎯 C'EST TOUT!

Le script s'occupe de **tout**:
- ✅ Update FlowSpaces
- ✅ Build Docker
- ✅ Installer monitoring
- ✅ Configurer backups
- ✅ Configurer alertes
- ✅ Configurer auto-restart

---

## 📊 APRÈS LE SCRIPT

### Configuration Rapide (10 min)

1. **Uptime Kuma** (http://85.121.48.53:3002)
   - Create account
   - Add Monitor: https://www.flowspaces.work/health

2. **Grafana** (http://85.121.48.53:3003)
   - Login: admin / admin
   - **CHANGE PASSWORD**
   - Add Prometheus data source

3. **Portainer** (https://85.121.48.53:9000)
   - Create account
   - Manage containers

---

## ⚠️ IMPORTANT

### Password VPS
```
SSH: root@85.121.48.53
Password: EK&a0V@txAiQeVB!SMW4
```

### Change Grafana Password Immédiatement
```
Default: admin / admin
→ Change to your_strong_password
```

---

## 🆘 PROBLÈME?

### Script fails
```bash
# Check error
ssh root@85.121.48.53 'docker logs flowspaces'

# Run manually
ssh root@85.121.48.53 'cd /opt/flowspaces && docker build . && docker compose up -d'
```

### Health check fails
```bash
# Test direct
ssh root@85.121.48.53 'curl http://localhost:3001/health'

# Check logs
ssh root@85.121.48.53 'docker logs -f flowspaces'
```

### Services not responding
```bash
# Check all running
ssh root@85.121.48.53 'docker ps'

# Restart all
ssh root@85.121.48.53 'docker compose restart'
```

---

## ✅ SUCCESS = Tout est vert

```
✅ App @ https://www.flowspaces.work
✅ Uptime Kuma @ http://85.121.48.53:3002
✅ Portainer @ https://85.121.48.53:9000
✅ Prometheus @ http://85.121.48.53:9090
✅ Grafana @ http://85.121.48.53:3003
✅ Backups running (daily @ 2 AM)
✅ Monitoring active
✅ Auto-restart enabled
```

---

## 🚀 GO GO GO!

```bash
ssh root@85.121.48.53 'bash -s' < VPS_UPDATE_SCRIPT.sh
```

**Attends 15-20 min → Ton app est à jour avec monitoring! 🎉**
